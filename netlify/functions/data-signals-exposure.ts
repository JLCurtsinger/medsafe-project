import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

interface TopDrugItem {
  drugName: string;
  exposureCount: number;
}

interface SignalExposureItem {
  drugName: string;
  faersReports: number;
  exposureCount: number;
  ratePer100k: number;
}

interface SignalsExposureResponse {
  generatedAt: string;
  sources: {
    faers: string;
    cms: string;
  };
  timeWindowDays: number;
  exposureType: 'beneficiaries' | 'claims';
  items: SignalExposureItem[];
  topList: TopDrugItem[];
}

interface DebugInfo {
  cmsRequestUrl?: string;
  cmsStatus?: number;
  cmsContentType?: string;
  cmsFirstRowKeys?: string[];
  cmsSampleRow?: Record<string, unknown>;
  cmsDatasetMeta?: unknown;
  chosenNameField?: string;
  chosenExposureField?: string;
  chosenYear?: number;
  exposureType?: 'beneficiaries' | 'claims';
  derivedTopListPreview?: TopDrugItem[];
  faersRequestUrl?: string;
  faersStatus?: number;
  faersRawCount?: number;
  fetchErrorStage?: 'cms_meta' | 'cms_data' | 'faers';
  responseSnippet?: string;
  cacheHit?: {
    cms?: boolean;
    faers?: boolean;
  };
  selectedDrug?: string;
  itemPreview?: SignalExposureItem;
}

interface CacheEntry {
  data: SignalsExposureResponse | { topList: TopDrugItem[]; exposureType: 'beneficiaries' | 'claims' };
  expiresAt: number;
}

// In-memory caches
let cmsTopListCache: CacheEntry | null = null;
const faersCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
const FETCH_TIMEOUT_MS = 10000; // 10 seconds

const CMS_DATASET_ID = '7e0b4365-fd63-4a29-8f5e-e0ac9f66a81b';
const CMS_API_BASE = `https://data.cms.gov/data-api/v1/dataset/${CMS_DATASET_ID}`;
const CMS_DATA_URL = `${CMS_API_BASE}/data`;
const OPENFDA_API_BASE = 'https://api.fda.gov/drug/event.json';

// CORS headers helper
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function sanitizeSampleRow(row: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  const maxValueLength = 200;
  
  for (const [key, value] of Object.entries(row)) {
    if (typeof value === 'string' && value.length > maxValueLength) {
      sanitized[key] = value.substring(0, maxValueLength) + '... (truncated)';
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

function chooseNameField(columns: string[]): string | null {
  // Prefer Gnrc_Name (generic name)
  if (columns.includes('Gnrc_Name')) {
    return 'Gnrc_Name';
  }
  // Fallback to Brnd_Name (brand name)
  if (columns.includes('Brnd_Name')) {
    return 'Brnd_Name';
  }
  // Try other variations
  const lower = columns.map(c => c.toLowerCase());
  if (lower.includes('generic_name')) {
    return columns[lower.indexOf('generic_name')];
  }
  if (lower.includes('drug_name')) {
    return columns[lower.indexOf('drug_name')];
  }
  // Last resort: any field with "name" in it
  for (const col of columns) {
    if (col.toLowerCase().includes('name')) {
      return col;
    }
  }
  return null;
}

function chooseExposureField(columns: string[]): { field: string | null; year: number | null; type: 'beneficiaries' | 'claims' } {
  // Look for Tot_Benes_YYYY pattern (beneficiaries)
  const benePattern = /^Tot_Benes_(\d{4})$/;
  const beneFields: Array<{ field: string; year: number }> = [];
  
  for (const col of columns) {
    const match = col.match(benePattern);
    if (match) {
      const year = parseInt(match[1], 10);
      beneFields.push({ field: col, year });
    }
  }
  
  if (beneFields.length > 0) {
    // Sort by year descending and pick latest
    beneFields.sort((a, b) => b.year - a.year);
    return { field: beneFields[0].field, year: beneFields[0].year, type: 'beneficiaries' };
  }
  
  // Fallback to Tot_Clms_YYYY pattern (claims)
  const clmsPattern = /^Tot_Clms_(\d{4})$/;
  const clmsFields: Array<{ field: string; year: number }> = [];
  
  for (const col of columns) {
    const match = col.match(clmsPattern);
    if (match) {
      const year = parseInt(match[1], 10);
      clmsFields.push({ field: col, year });
    }
  }
  
  if (clmsFields.length > 0) {
    // Sort by year descending and pick latest
    clmsFields.sort((a, b) => b.year - a.year);
    return { field: clmsFields[0].field, year: clmsFields[0].year, type: 'claims' };
  }
  
  // Last resort: try generic patterns
  const lower = columns.map(c => c.toLowerCase());
  for (const col of columns) {
    const lowerCol = col.toLowerCase();
    if (lowerCol.includes('bene') || lowerCol.includes('beneficiar')) {
      return { field: col, year: null, type: 'beneficiaries' };
    }
  }
  for (const col of columns) {
    const lowerCol = col.toLowerCase();
    if (lowerCol.includes('claim') || lowerCol.includes('clm')) {
      return { field: col, year: null, type: 'claims' };
    }
  }
  
  return { field: null, year: null, type: 'claims' };
}

function cleanDrugNameForFaers(drugName: string): string {
  // Remove trailing "*" and trim whitespace
  return drugName.replace(/\*+$/, '').trim();
}

function buildFaersUrl(drugName: string, startDate: string, endDate: string, useExact: boolean = true): string {
  // Clean drug name for FAERS query
  const cleanName = cleanDrugNameForFaers(drugName);
  const searchQuery = useExact
    ? `receivedate:[${startDate}+TO+${endDate}]+AND+patient.drug.medicinalproduct.exact:"${cleanName}"`
    : `receivedate:[${startDate}+TO+${endDate}]+AND+patient.drug.medicinalproduct:"${cleanName}"`;
  const params = new URLSearchParams({
    search: searchQuery,
    limit: '1',
  });
  return `${OPENFDA_API_BASE}?${params.toString()}`;
}

function getDateRange(days: number): { start: string; end: string } {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  
  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  };
  
  return {
    start: formatDate(start),
    end: formatDate(end),
  };
}

async function fetchCmsMetadata(debug: boolean): Promise<{ columns: string[]; meta: unknown } | null> {
  const url = CMS_API_BASE;
  
  console.error('[data-signals-exposure]', {
    step: 'fetching CMS metadata',
    url,
    timestamp: new Date().toISOString(),
  });
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'MedSafe Project (https://medsafeproject.org)',
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const responseText = await response.text();
      const snippet = responseText.substring(0, 400);
      console.error('[data-signals-exposure]', {
        step: 'CMS metadata error',
        status: response.status,
        snippet,
        timestamp: new Date().toISOString(),
      });
      return null; // Fall back to deriving from data
    }
    
    const data = await response.json();
    
    // Try to extract columns from metadata
    // CMS API metadata structure may vary
    let columns: string[] = [];
    
    if (data.columns && Array.isArray(data.columns)) {
      columns = data.columns.map((col: unknown) => {
        if (typeof col === 'string') return col;
        if (typeof col === 'object' && col !== null && 'name' in col) {
          return String(col.name);
        }
        return String(col);
      });
    } else if (data.fields && Array.isArray(data.fields)) {
      columns = data.fields.map((field: unknown) => {
        if (typeof field === 'string') return field;
        if (typeof field === 'object' && field !== null && 'name' in field) {
          return String(field.name);
        }
        return String(field);
      });
    }
    
    return { columns, meta: data };
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('[data-signals-exposure]', {
        step: 'CMS metadata timeout',
        timestamp: new Date().toISOString(),
      });
    }
    
    return null; // Fall back to deriving from data
  }
}

async function fetchCmsTopList(debug: boolean = false): Promise<{ topList: TopDrugItem[]; exposureType: 'beneficiaries' | 'claims'; debugInfo?: DebugInfo }> {
  const debugInfo: DebugInfo = {};
  
  // Check cache (skip if debug)
  if (!debug && cmsTopListCache && Date.now() < cmsTopListCache.expiresAt) {
    const cached = cmsTopListCache.data as { topList: TopDrugItem[]; exposureType: 'beneficiaries' | 'claims' };
    if (debug) {
      debugInfo.cacheHit = { cms: true };
    }
    return cached;
  }
  
  // Try to fetch metadata first
  const metadata = await fetchCmsMetadata(debug);
  if (metadata && debug) {
    debugInfo.cmsDatasetMeta = metadata.meta;
  }
  
  // Fetch data
  const dataUrl = `${CMS_DATA_URL}?size=200`;
  debugInfo.cmsRequestUrl = dataUrl;
  
  console.error('[data-signals-exposure]', {
    step: 'fetching CMS data',
    url: dataUrl,
    timestamp: new Date().toISOString(),
  });
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  
  try {
    const response = await fetch(dataUrl, {
      headers: {
        'User-Agent': 'MedSafe Project (https://medsafeproject.org)',
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    debugInfo.cmsStatus = response.status;
    debugInfo.cmsContentType = response.headers.get('content-type') || undefined;
    
    if (!response.ok) {
      const responseText = await response.text();
      const snippet = responseText.substring(0, 400);
      debugInfo.responseSnippet = snippet;
      debugInfo.fetchErrorStage = 'cms_data';
      
      console.error('[data-signals-exposure]', {
        step: 'CMS API error',
        status: response.status,
        statusText: response.statusText,
        snippet,
        timestamp: new Date().toISOString(),
      });
      
      throw new Error(`CMS API error: ${response.status} ${response.statusText}. Response: ${snippet}`);
    }
    
    const data = await response.json();
    
    if (!Array.isArray(data) || data.length === 0) {
      debugInfo.fetchErrorStage = 'cms_data';
      throw new Error('CMS API returned empty or invalid data');
    }
    
    // Extract column names from first row if metadata didn't provide them
    const firstRow = data[0] as Record<string, unknown>;
    const columns = metadata?.columns || Object.keys(firstRow);
    
    debugInfo.cmsFirstRowKeys = columns;
    debugInfo.cmsSampleRow = sanitizeSampleRow(firstRow);
    
    // Choose name field (prefer Gnrc_Name)
    const nameField = chooseNameField(columns);
    debugInfo.chosenNameField = nameField || undefined;
    
    // Choose exposure field (prefer latest year)
    const exposureResult = chooseExposureField(columns);
    const exposureField = exposureResult.field;
    const exposureType: "beneficiaries" | "claims" = exposureResult.type;
    debugInfo.chosenExposureField = exposureField || undefined;
    debugInfo.chosenYear = exposureResult.year || undefined;
    debugInfo.exposureType = exposureType;
    
    if (!nameField || !exposureField) {
      debugInfo.fetchErrorStage = 'cms_data';
      throw new Error(
        `Could not identify required fields. Name field: ${nameField || 'not found'}. ` +
        `Exposure field: ${exposureField || 'not found'}. Available columns: ${columns.join(', ')}`
      );
    }
    
    // Filter rows: if Mftr_Name exists, prefer rows where Mftr_Name === "Overall"
    let filteredData = data;
    const hasMftrName = columns.some(c => c.toLowerCase().includes('mftr') || c.toLowerCase().includes('manufacturer'));
    if (hasMftrName) {
      const mftrField = columns.find(c => c.toLowerCase().includes('mftr') || c.toLowerCase().includes('manufacturer'));
      if (mftrField) {
        const overallRows = data.filter((row: unknown) => {
          const rowObj = row as Record<string, unknown>;
          const mftrValue = rowObj[mftrField];
          return mftrValue && String(mftrValue).toLowerCase().trim() === 'overall';
        });
        
        // Use filtered rows if we have any, otherwise fall back to all rows
        if (overallRows.length > 0) {
          filteredData = overallRows;
        }
      }
    }
    
    // Parse and aggregate data (deduplicate by drug name)
    const drugMap = new Map<string, number>();
    
    for (const row of filteredData) {
      const rowObj = row as Record<string, unknown>;
      const nameValue = rowObj[nameField];
      const exposureValue = rowObj[exposureField];
      
      if (!nameValue || !exposureValue) continue;
      
      // Normalize drug name (trim, uppercase)
      const drugName = typeof nameValue === 'string' 
        ? nameValue.trim().toUpperCase() 
        : String(nameValue).trim().toUpperCase();
      if (!drugName) continue;
      
      // Parse exposure count
      let exposureCount = 0;
      if (typeof exposureValue === 'number') {
        exposureCount = exposureValue;
      } else if (typeof exposureValue === 'string') {
        exposureCount = parseFloat(exposureValue.replace(/,/g, ''));
      }
      
      if (isNaN(exposureCount) || exposureCount <= 0) continue;
      
      // Aggregate: sum exposure counts for same drug name
      const existing = drugMap.get(drugName) || 0;
      drugMap.set(drugName, existing + Math.round(exposureCount));
    }
    
    if (drugMap.size === 0) {
      debugInfo.fetchErrorStage = 'cms_data';
      throw new Error('Could not extract drug names or exposure counts from CMS data');
    }
    
    // Convert map to array and sort by exposure count descending
    const topList: TopDrugItem[] = Array.from(drugMap.entries())
      .map(([drugName, exposureCount]) => ({ drugName, exposureCount }))
      .sort((a, b) => b.exposureCount - a.exposureCount)
      .slice(0, 50); // Top 50
    
    // Defensive check: if topList is empty, return empty result
    if (!topList.length) {
      debugInfo.fetchErrorStage = 'cms_data';
      throw new Error('CMS data parsed but resulted in empty top list');
    }
    
    debugInfo.derivedTopListPreview = topList.slice(0, 10);
    
    const result = { topList, exposureType };
    
    // Cache the result (only if not debug)
    if (!debug) {
      cmsTopListCache = {
        data: result,
        expiresAt: Date.now() + CACHE_TTL_MS,
      };
    }
    
    console.error('[data-signals-exposure]', {
      step: 'CMS top list fetched',
      count: topList.length,
      exposureType,
      nameField,
      exposureField,
      timestamp: new Date().toISOString(),
    });
    
    return { ...result, debugInfo: debug ? debugInfo : undefined };
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error && error.name === 'AbortError') {
      debugInfo.fetchErrorStage = 'cms_data';
      throw new Error(`CMS API request timed out after ${FETCH_TIMEOUT_MS}ms`);
    }
    
    // Re-throw with debug info if available
    if (debug && Object.keys(debugInfo).length > 0) {
      const debugError = error as Error & { debugInfo?: DebugInfo };
      debugError.debugInfo = debugInfo;
      throw debugError;
    }
    
    throw error;
  }
}

async function fetchFaersCount(drugName: string, days: number = 365, debug: boolean = false): Promise<{ count: number; debugInfo?: DebugInfo }> {
  const debugInfo: DebugInfo = {};
  
  // Check cache (skip if debug)
  const cacheKey = `${drugName}:${days}`;
  const cached = faersCache.get(cacheKey);
  if (!debug && cached && Date.now() < cached.expiresAt) {
    const count = cached.data as number;
    if (debug) {
      debugInfo.cacheHit = { faers: true };
    }
    return { count, debugInfo: debug ? debugInfo : undefined };
  }
  
  const { start, end } = getDateRange(days);
  const cleanName = cleanDrugNameForFaers(drugName);
  
  // Use exact match by default
  let url = buildFaersUrl(drugName, start, end, true);
  debugInfo.faersRequestUrl = url;
  
  console.error('[data-signals-exposure]', {
    step: 'fetching FAERS count',
    drugName,
    cleanName,
    url,
    timestamp: new Date().toISOString(),
  });
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  
  try {
    let response = await fetch(url, {
      headers: {
        'User-Agent': 'MedSafe Project (https://medsafeproject.org)',
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    debugInfo.faersStatus = response.status;
    
    if (!response.ok) {
      // 404 means no results, treat as 0
      if (response.status === 404) {
        console.error('[data-signals-exposure]', {
          step: 'FAERS no results (404)',
          drugName,
          cleanName,
          timestamp: new Date().toISOString(),
        });
        return { count: 0, debugInfo: debug ? debugInfo : undefined };
      }
      
      const responseText = await response.text();
      const snippet = responseText.substring(0, 400);
      debugInfo.responseSnippet = snippet;
      debugInfo.fetchErrorStage = 'faers';
      
      console.error('[data-signals-exposure]', {
        step: 'FAERS API error',
        drugName,
        cleanName,
        status: response.status,
        statusText: response.statusText,
        snippet,
        timestamp: new Date().toISOString(),
      });
      
      // Return 0 instead of throwing on API errors
      return { count: 0, debugInfo: debug ? debugInfo : undefined };
    }
    
    const data = await response.json();
    
    // Parse count from openFDA meta.results.total
    let count = 0;
    
    if (data.meta?.results?.total !== undefined) {
      count = typeof data.meta.results.total === 'number' 
        ? data.meta.results.total 
        : parseInt(String(data.meta.results.total), 10);
    } else if (data.results && Array.isArray(data.results) && data.results.length > 0) {
      // Fallback to counting results array length if meta.total not available
      count = data.results.length;
    }
    
    debugInfo.faersRawCount = count;
    
    // Cache the result (only if not debug)
    if (!debug) {
      faersCache.set(cacheKey, {
        data: count,
        expiresAt: Date.now() + CACHE_TTL_MS,
      });
    }
    
    console.error('[data-signals-exposure]', {
      step: 'FAERS count fetched',
      drugName,
      count,
      timestamp: new Date().toISOString(),
    });
    
    return { count, debugInfo: debug ? debugInfo : undefined };
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error && error.name === 'AbortError') {
      debugInfo.fetchErrorStage = 'faers';
      // Return 0 instead of throwing on timeout
      return { count: 0, debugInfo: debug ? debugInfo : undefined };
    }
    
    // Return 0 instead of throwing
    return { count: 0, debugInfo: debug ? debugInfo : undefined };
  }
}

export const handler: Handler = async (
  event: HandlerEvent,
  context: HandlerContext
): Promise<{ statusCode: number; headers: Record<string, string>; body: string }> => {
  // Handle OPTIONS preflight request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
      body: JSON.stringify({}),
    };
  }

  const requestedDrug = event.queryStringParameters?.drug;
  const debug = event.queryStringParameters?.debug === '1';
  const timeWindowDays = 365;

  try {
    // Fetch CMS top list
    const cmsResult = await fetchCmsTopList(debug);
    const { topList, exposureType, debugInfo: cmsDebugInfo } = cmsResult;
    
    // Create base response object to prevent "forgot to include exposureType" bugs
    const baseResponse = {
      generatedAt: new Date().toISOString(),
      sources: {
        faers: 'openFDA drug/event.json',
        cms: `data.cms.gov Part D Spending by Drug (dataset ${CMS_DATASET_ID})`,
      },
      timeWindowDays,
      exposureType,
    };
    
    // Defensive check: if topList is empty, return valid response with empty items
    if (!topList || !topList.length) {
      const response: SignalsExposureResponse & { debug?: DebugInfo } = {
        ...baseResponse,
        items: [],
        topList: [],
      };
      
      if (debug && cmsDebugInfo) {
        response.debug = cmsDebugInfo;
      }
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': debug ? 'no-cache' : 'public, max-age=3600',
          ...corsHeaders,
        },
        body: JSON.stringify(response),
      };
    }
    
    // Determine selected drug: use requested drug if provided, otherwise default to first in topList
    const selectedDrugName = requestedDrug 
      ? topList.find(d => d.drugName.toUpperCase() === requestedDrug.toUpperCase())?.drugName || topList[0]?.drugName
      : topList[0]?.drugName;
    
    if (!selectedDrugName) {
      // Return valid response with empty items instead of error
      const response: SignalsExposureResponse & { debug?: DebugInfo } = {
        ...baseResponse,
        items: [],
        topList,
      };
      
      if (debug && cmsDebugInfo) {
        response.debug = cmsDebugInfo;
      }
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': debug ? 'no-cache' : 'public, max-age=3600',
          ...corsHeaders,
        },
        body: JSON.stringify(response),
      };
    }
    
    // Find exposure count for the selected drug
    const selectedDrug = topList.find(d => d.drugName === selectedDrugName);
    if (!selectedDrug) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
        body: JSON.stringify({
          error: 'Drug not found',
          details: `Drug "${selectedDrugName}" not found in top list`,
          generatedAt: new Date().toISOString(),
          exposureType,
          ...(debug && cmsDebugInfo ? { debug: cmsDebugInfo } : {}),
        }),
      };
    }
    
    // Fetch FAERS count (use cleaned name for query, but keep original for display)
    const faersResult = await fetchFaersCount(selectedDrugName, timeWindowDays, debug);
    const { count: faersReports, debugInfo: faersDebugInfo } = faersResult;
    
    // Calculate rate per 100k
    const ratePer100k = selectedDrug.exposureCount > 0
      ? (faersReports / selectedDrug.exposureCount) * 100000
      : 0;
    
    const item: SignalExposureItem = {
      drugName: selectedDrug.drugName,
      faersReports,
      exposureCount: selectedDrug.exposureCount,
      ratePer100k: Math.round(ratePer100k * 10) / 10, // Round to 1 decimal
    };
    
    const response: SignalsExposureResponse & { debug?: DebugInfo } = {
      ...baseResponse,
      items: [item], // Always return single item
      topList,
    };
    
    if (debug) {
      response.debug = {
        ...cmsDebugInfo,
        ...faersDebugInfo,
        selectedDrug: selectedDrugName,
        itemPreview: item,
      };
    }
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': debug ? 'no-cache' : 'public, max-age=3600',
        ...corsHeaders,
      },
      body: JSON.stringify(response),
    };
  } catch (error) {
    const errorName = error instanceof Error ? error.name : 'Unknown';
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    const debugInfo = (error as Error & { debugInfo?: DebugInfo })?.debugInfo;
    
    // Default exposureType if CMS parsing failed
    const exposureType: "beneficiaries" | "claims" = "beneficiaries";
    
    console.error('[data-signals-exposure]', {
      step: 'handler error',
      errorName,
      errorMessage,
      errorStack,
      timestamp: new Date().toISOString(),
    });
    
    // If we have debug info from CMS parsing failure, include it
    if (errorMessage.includes('CMS schema parse failed') || errorMessage.includes('Could not identify')) {
      const errorResponse: Record<string, unknown> = {
        error: 'CMS schema parse failed',
        details: errorMessage,
        generatedAt: new Date().toISOString(),
        exposureType,
        ...(debugInfo || {}),
      };
      
      if (debug) {
        errorResponse.debug = { ...debugInfo, exposureType };
      }
      
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
        body: JSON.stringify(errorResponse),
      };
    }
    
    const errorResponse: Record<string, unknown> = {
      error: 'data-signals-exposure failed',
      details: `${errorName}: ${errorMessage}`,
      generatedAt: new Date().toISOString(),
      exposureType,
      ...(debug && debugInfo ? { debug: { ...debugInfo, exposureType } } : {}),
    };
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
      body: JSON.stringify(errorResponse),
    };
  }
};
