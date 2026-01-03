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

function scoreNameField(fieldName: string): number {
  const lower = fieldName.toLowerCase();
  let score = 0;
  
  // Exact matches score highest
  if (lower === 'generic_name' || lower === 'drug_name') {
    score += 100;
  }
  
  // Contains both "generic" and "name"
  if (lower.includes('generic') && lower.includes('name')) {
    score += 50;
  }
  
  // Contains "drug" and "name"
  if (lower.includes('drug') && lower.includes('name')) {
    score += 40;
  }
  
  // Contains "generic" or "drug"
  if (lower.includes('generic')) {
    score += 20;
  }
  if (lower.includes('drug')) {
    score += 15;
  }
  
  // Contains "name"
  if (lower.includes('name')) {
    score += 10;
  }
  
  return score;
}

function scoreExposureField(fieldName: string): { score: number; type: 'beneficiaries' | 'claims' } {
  const lower = fieldName.toLowerCase();
  let score = 0;
  let type: 'beneficiaries' | 'claims' = 'claims';
  
  // Beneficiaries fields score higher
  if (lower.includes('bene') || lower.includes('beneficiar')) {
    score += 100;
    type = 'beneficiaries';
  }
  
  // Claim fields
  if (lower.includes('claim')) {
    score += 50;
    if (type !== 'beneficiaries') {
      type = 'claims';
    }
  }
  
  // Count indicators
  if (lower.includes('count') || lower.includes('cnt')) {
    score += 20;
  }
  
  // Total indicators
  if (lower.includes('total') || lower.includes('tot')) {
    score += 10;
  }
  
  return { score, type };
}

function chooseFields(columns: string[]): { nameField: string | null; exposureField: string | null; exposureType: 'beneficiaries' | 'claims' } {
  let bestNameField: { field: string; score: number } | null = null;
  let bestExposureField: { field: string; score: number; type: 'beneficiaries' | 'claims' } | null = null;
  
  for (const col of columns) {
    const nameScore = scoreNameField(col);
    if (!bestNameField || nameScore > bestNameField.score) {
      bestNameField = { field: col, score: nameScore };
    }
    
    const exposureResult = scoreExposureField(col);
    if (!bestExposureField || exposureResult.score > bestExposureField.score) {
      bestExposureField = { field: col, score: exposureResult.score, type: exposureResult.type };
    }
  }
  
  return {
    nameField: bestNameField?.score > 0 ? bestNameField.field : null,
    exposureField: bestExposureField?.score > 0 ? bestExposureField.field : null,
    exposureType: bestExposureField?.type || 'claims',
  };
}

function buildFaersUrl(drugName: string, startDate: string, endDate: string, useExact: boolean = false): string {
  const searchQuery = useExact
    ? `receivedate:[${startDate}+TO+${endDate}]+AND+patient.drug.medicinalproduct.exact:"${drugName}"`
    : `receivedate:[${startDate}+TO+${endDate}]+AND+patient.drug.medicinalproduct:"${drugName}"`;
  const params = new URLSearchParams({
    search: searchQuery,
    count: 'patient.drug.medicinalproduct.exact',
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
    
    // Choose best fields using scoring
    const { nameField, exposureField, exposureType } = chooseFields(columns);
    
    debugInfo.chosenNameField = nameField || undefined;
    debugInfo.chosenExposureField = exposureField || undefined;
    debugInfo.exposureType = exposureType;
    
    if (!nameField || !exposureField) {
      debugInfo.fetchErrorStage = 'cms_data';
      throw new Error(
        `Could not identify required fields. Name candidates: ${columns.filter(c => scoreNameField(c) > 0).join(', ') || 'none'}. ` +
        `Exposure candidates: ${columns.filter(c => scoreExposureField(c).score > 0).join(', ') || 'none'}.`
      );
    }
    
    // Parse data
    const topList: TopDrugItem[] = [];
    
    for (const row of data) {
      const rowObj = row as Record<string, unknown>;
      const nameValue = rowObj[nameField];
      const exposureValue = rowObj[exposureField];
      
      if (!nameValue || !exposureValue) continue;
      
      // Normalize drug name
      const drugName = typeof nameValue === 'string' ? nameValue.trim().toUpperCase() : String(nameValue).trim().toUpperCase();
      if (!drugName) continue;
      
      // Parse exposure count
      let exposureCount = 0;
      if (typeof exposureValue === 'number') {
        exposureCount = exposureValue;
      } else if (typeof exposureValue === 'string') {
        exposureCount = parseFloat(exposureValue.replace(/,/g, ''));
      }
      
      if (isNaN(exposureCount) || exposureCount <= 0) continue;
      
      topList.push({
        drugName,
        exposureCount: Math.round(exposureCount),
      });
    }
    
    if (topList.length === 0) {
      debugInfo.fetchErrorStage = 'cms_data';
      throw new Error('Could not extract drug names or exposure counts from CMS data');
    }
    
    // Sort by exposure count descending and take top 50
    topList.sort((a, b) => b.exposureCount - a.exposureCount);
    const top50 = topList.slice(0, 50);
    
    debugInfo.derivedTopListPreview = top50.slice(0, 10);
    
    const result = { topList: top50, exposureType };
    
    // Cache the result (only if not debug)
    if (!debug) {
      cmsTopListCache = {
        data: result,
        expiresAt: Date.now() + CACHE_TTL_MS,
      };
    }
    
    console.error('[data-signals-exposure]', {
      step: 'CMS top list fetched',
      count: top50.length,
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
  
  // Try first with regular search
  let url = buildFaersUrl(drugName, start, end, false);
  debugInfo.faersRequestUrl = url;
  
  console.error('[data-signals-exposure]', {
    step: 'fetching FAERS count',
    drugName,
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
      const responseText = await response.text();
      const snippet = responseText.substring(0, 400);
      debugInfo.responseSnippet = snippet;
      debugInfo.fetchErrorStage = 'faers';
      
      console.error('[data-signals-exposure]', {
        step: 'FAERS API error (attempt 1)',
        drugName,
        status: response.status,
        statusText: response.statusText,
        snippet,
        timestamp: new Date().toISOString(),
      });
      
      // Try fallback with exact match
      const fallbackUrl = buildFaersUrl(drugName, start, end, true);
      debugInfo.faersRequestUrl = fallbackUrl;
      
      const fallbackController = new AbortController();
      const fallbackTimeoutId = setTimeout(() => fallbackController.abort(), FETCH_TIMEOUT_MS);
      
      try {
        response = await fetch(fallbackUrl, {
          headers: {
            'User-Agent': 'MedSafe Project (https://medsafeproject.org)',
          },
          signal: fallbackController.signal,
        });
        
        clearTimeout(fallbackTimeoutId);
        debugInfo.faersStatus = response.status;
        
        if (!response.ok) {
          // Both attempts failed, return 0 instead of error
          console.error('[data-signals-exposure]', {
            step: 'FAERS API error (attempt 2)',
            drugName,
            status: response.status,
            timestamp: new Date().toISOString(),
          });
          return { count: 0, debugInfo: debug ? debugInfo : undefined };
        }
      } catch (fallbackError) {
        clearTimeout(fallbackTimeoutId);
        // Return 0 instead of throwing
        return { count: 0, debugInfo: debug ? debugInfo : undefined };
      }
    }
    
    const data = await response.json();
    
    // Parse count from openFDA response
    let count = 0;
    
    if (data.results && Array.isArray(data.results) && data.results.length > 0) {
      const firstResult = data.results[0];
      if (firstResult.count !== undefined) {
        count = typeof firstResult.count === 'number' ? firstResult.count : parseInt(String(firstResult.count), 10);
      }
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

  const drugName = event.queryStringParameters?.drug;
  const debug = event.queryStringParameters?.debug === '1';
  const timeWindowDays = 365;

  try {
    // Fetch CMS top list
    const cmsResult = await fetchCmsTopList(debug);
    const { topList, exposureType, debugInfo: cmsDebugInfo } = cmsResult;
    
    // If no drug specified, return just the top list
    if (!drugName) {
      const response: SignalsExposureResponse & { debug?: DebugInfo } = {
        generatedAt: new Date().toISOString(),
        sources: {
          faers: 'openFDA drug/event.json',
          cms: `data.cms.gov Part D Spending by Drug (dataset ${CMS_DATASET_ID})`,
        },
        timeWindowDays,
        exposureType,
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
    const selectedDrug = topList.find(d => d.drugName.toUpperCase() === drugName.toUpperCase());
    if (!selectedDrug) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
        body: JSON.stringify({
          error: 'Drug not found',
          details: `Drug "${drugName}" not found in top list`,
          generatedAt: new Date().toISOString(),
          ...(debug && cmsDebugInfo ? { debug: cmsDebugInfo } : {}),
        }),
      };
    }
    
    // Fetch FAERS count
    const faersResult = await fetchFaersCount(drugName, timeWindowDays, debug);
    const { count: faersReports, debugInfo: faersDebugInfo } = faersResult;
    
    // Calculate rate per 100k
    const ratePer100k = selectedDrug.exposureCount > 0
      ? (faersReports / selectedDrug.exposureCount) * 100000
      : 0;
    
    const response: SignalsExposureResponse & { debug?: DebugInfo } = {
      generatedAt: new Date().toISOString(),
      sources: {
        faers: 'openFDA drug/event.json',
        cms: `data.cms.gov Part D Spending by Drug (dataset ${CMS_DATASET_ID})`,
      },
      timeWindowDays,
      exposureType,
      items: [
        {
          drugName: selectedDrug.drugName,
          faersReports,
          exposureCount: selectedDrug.exposureCount,
          ratePer100k: Math.round(ratePer100k * 10) / 10, // Round to 1 decimal
        },
      ],
      topList,
    };
    
    if (debug) {
      response.debug = {
        ...cmsDebugInfo,
        ...faersDebugInfo,
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
    
    console.error('[data-signals-exposure]', {
      step: 'handler error',
      errorName,
      errorMessage,
      errorStack,
      timestamp: new Date().toISOString(),
    });
    
    // If we have debug info from CMS parsing failure, include it
    if (errorMessage.includes('CMS schema parse failed') || errorMessage.includes('Could not identify')) {
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
        body: JSON.stringify({
          error: 'CMS schema parse failed',
          details: errorMessage,
          generatedAt: new Date().toISOString(),
          ...(debugInfo || {}),
        }),
      };
    }
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
      body: JSON.stringify({
        error: 'data-signals-exposure failed',
        details: `${errorName}: ${errorMessage}`,
        generatedAt: new Date().toISOString(),
        ...(debug && debugInfo ? { debug: debugInfo } : {}),
      }),
    };
  }
};
