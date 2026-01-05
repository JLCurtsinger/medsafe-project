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
  topListPreview?: TopDrugItem[];
  filteredOutCounts?: {
    needles?: number;
    vaccines?: number;
    pref?: number;
    empty?: number;
    commasOrSlashes?: number;
  };
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
  selectedDrugRaw?: string;
  selectedDrugQueryName?: string;
  faersAttemptedQueries?: Array<{ label: string; url: string; total?: number; error?: string }>;
  faersChosen?: { label: string; total: number };
  // New debug fields
  cmsUsedYear?: number;
  cmsNameField?: string;
  topListFirst10?: TopDrugItem[];
  cacheBypassed?: boolean;
  selectedDrugNormalized?: string;
  resolvedRxcui?: string | null;
  faersStrategyUsed?: 'rxcui' | 'name-fallback';
  faersSearchUrlUsed?: string;
  faersTotal?: number;
  faersFinalUrlUsed?: string;
  faersStatus?: number;
  faersTotalParsed?: number;
  faersErrorText?: string;
}

interface CacheEntry {
  data: SignalsExposureResponse | { topList: TopDrugItem[]; exposureType: 'beneficiaries' | 'claims' };
  expiresAt: number;
}

// Cache version for cache busting on deploys
const CACHE_VERSION = 'v5';

// In-memory caches
let cmsTopListCache: CacheEntry | null = null;
const faersCache = new Map<string, CacheEntry>();
const rxcuiCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
const RXCUI_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const FETCH_TIMEOUT_MS = 10000; // 10 seconds

const CMS_DATASET_ID = '7e0b4365-fd63-4a29-8f5e-e0ac9f66a81b';
const CMS_API_BASE = `https://data.cms.gov/data-api/v1/dataset/${CMS_DATASET_ID}`;
const CMS_DATA_URL = `${CMS_API_BASE}/data`;
const OPENFDA_API_BASE = 'https://api.fda.gov/drug/event.json';
const RXNORM_API_BASE = 'https://rxnav.nlm.nih.gov/REST';

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

function normalizeCmsNameForFaers(raw: string): { displayName: string; queryName: string } {
  // displayName is the raw name for UI
  const displayName = raw;
  
  // queryName is cleaned for FAERS searching
  let queryName = raw;
  
  // uppercase + trim
  queryName = queryName.toUpperCase().trim();
  
  // remove trailing "*"
  queryName = queryName.replace(/\*+$/, '');
  
  // remove anything after a comma (keep left side)
  if (queryName.includes(',')) {
    queryName = queryName.split(',')[0].trim();
  }
  
  // remove tokens: "PREF", "PF", "ER", "XR", "SR"
  // Use word boundaries to avoid partial matches
  queryName = queryName.replace(/\bPREF\b/gi, '');
  queryName = queryName.replace(/\bPF\b/gi, '');
  queryName = queryName.replace(/\bER\b/gi, '');
  queryName = queryName.replace(/\bXR\b/gi, '');
  queryName = queryName.replace(/\bSR\b/gi, '');
  
  // if contains " WITH " -> keep left side (primary ingredient)
  if (queryName.includes(' WITH ')) {
    queryName = queryName.split(' WITH ')[0].trim();
  }
  
  // if contains "/" -> keep left side
  if (queryName.includes('/')) {
    queryName = queryName.split('/')[0].trim();
  }
  
  // collapse whitespace
  queryName = queryName.replace(/\s+/g, ' ').trim();
  
  return { displayName, queryName };
}

/**
 * Normalize drug name for RxNorm query (server-side normalization)
 * - Uppercase, trim
 * - Remove trailing *
 * - Replace / and , with spaces
 * - Collapse whitespace
 * - If contains " WITH ", try full string first, then left-side token as fallback
 */
function normalizeForRxNorm(drugName: string): string[] {
  let normalized = drugName.toUpperCase().trim();
  
  // Remove trailing *
  normalized = normalized.replace(/\*+$/, '');
  
  // Replace / and , with spaces
  normalized = normalized.replace(/[/,]/g, ' ');
  
  // Collapse whitespace
  normalized = normalized.replace(/\s+/g, ' ').trim();
  
  // If contains " WITH ", return both full string and left-side token
  if (normalized.includes(' WITH ')) {
    const leftSide = normalized.split(' WITH ')[0].trim();
    return [normalized, leftSide];
  }
  
  return [normalized];
}

/**
 * Resolve drug name to RxNorm RxCUI using approximate term endpoint
 * Returns RxCUI string or null if not found
 */
async function resolveRxcui(drugName: string, debug: boolean = false): Promise<string | null> {
  const normalizedNames = normalizeForRxNorm(drugName);
  const cacheKey = `rxcui:${CACHE_VERSION}:${normalizedNames[0]}`;
  
  // Check cache
  const cached = rxcuiCache.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.data as string | null;
  }
  
  // Try each normalized name variant
  for (const normalizedName of normalizedNames) {
    const url = `${RXNORM_API_BASE}/approximateTerm.json?term=${encodeURIComponent(normalizedName)}&maxEntries=1`;
    
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
        continue; // Try next variant
      }
      
      const data = await response.json();
      
      // RxNorm approximateTerm response structure:
      // { approximateGroup: { candidate: [{ rxcui: "...", ... }] } }
      if (data.approximateGroup?.candidate && Array.isArray(data.approximateGroup.candidate)) {
        const candidates = data.approximateGroup.candidate;
        if (candidates.length > 0 && candidates[0].rxcui) {
          const rxcui = String(candidates[0].rxcui);
          
          // Cache the result
          rxcuiCache.set(cacheKey, {
            data: rxcui,
            expiresAt: Date.now() + RXCUI_CACHE_TTL_MS,
          });
          
          return rxcui;
        }
      }
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        continue; // Try next variant on timeout
      }
      continue; // Try next variant on other errors
    }
  }
  
  // Cache null result to avoid repeated failed lookups
  rxcuiCache.set(cacheKey, {
    data: null,
    expiresAt: Date.now() + RXCUI_CACHE_TTL_MS,
  });
  
  return null;
}

function buildFaersUrl(
  startDate: string,
  endDate: string,
  queryType: 'rxcui' | 'generic_exact' | 'brand_exact' | 'medicinalproduct',
  value: string
): string {
  // Use spaces (not '+') in the search string
  const dateConstraint = `receivedate:[${startDate} TO ${endDate}]`;
  let drugConstraint: string;
  
  switch (queryType) {
    case 'rxcui':
      drugConstraint = `patient.drug.openfda.rxcui:"${value}"`;
      break;
    case 'generic_exact':
      drugConstraint = `patient.drug.openfda.generic_name.exact:"${value}"`;
      break;
    case 'brand_exact':
      drugConstraint = `patient.drug.openfda.brand_name.exact:"${value}"`;
      break;
    case 'medicinalproduct':
      drugConstraint = `patient.drug.medicinalproduct:"${value}"`;
      break;
  }
  
  // Build search string with spaces (not '+')
  const searchQuery = `${dateConstraint} AND ${drugConstraint}`;
  
  // Encode the entire search string once using encodeURIComponent
  // This will encode spaces as %20, not %2B
  const encodedSearch = encodeURIComponent(searchQuery);
  
  // Build URL manually to avoid double-encoding
  return `${OPENFDA_API_BASE}?search=${encodedSearch}&limit=1`;
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

async function fetchCmsTopList(debug: boolean = false, refresh: boolean = false): Promise<{ topList: TopDrugItem[]; exposureType: 'beneficiaries' | 'claims'; debugInfo?: DebugInfo }> {
  const debugInfo: DebugInfo = {};
  
  if (debug && refresh) {
    debugInfo.cacheBypassed = true;
  }
  
  // Check cache (skip if debug or refresh)
  if (!debug && !refresh && cmsTopListCache && Date.now() < cmsTopListCache.expiresAt) {
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
  
  // Extract column names from metadata if available, otherwise we'll get them from first row
  const columns = metadata?.columns || [];
  
  // Determine exposure field and year BEFORE fetching data (so we can sort)
  let exposureField: string | null = null;
  let exposureType: 'beneficiaries' | 'claims' = 'beneficiaries';
  let exposureYear: number | null = null;
  
  if (columns.length > 0) {
    const exposureResult = chooseExposureField(columns);
    exposureField = exposureResult.field;
    exposureType = exposureResult.type;
    exposureYear = exposureResult.year;
  }
  
  // If we don't have columns yet, fetch a small sample first to get them
  let dataUrl: string;
  if (!exposureField || columns.length === 0) {
    // Fetch small sample to get columns
    dataUrl = `${CMS_DATA_URL}?size=1`;
  } else {
    // Fetch sorted by exposure DESC with size=5000 (truly top by exposure)
    dataUrl = `${CMS_DATA_URL}?size=5000&sort=-${encodeURIComponent(exposureField)}`;
  }
  
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
    
    let data = await response.json();
    
    if (!Array.isArray(data) || data.length === 0) {
      debugInfo.fetchErrorStage = 'cms_data';
      throw new Error('CMS API returned empty or invalid data');
    }
    
    // Extract column names from first row if metadata didn't provide them
    const firstRow = data[0] as Record<string, unknown>;
    const finalColumns = (metadata && metadata.columns && metadata.columns.length > 0) ? metadata.columns : Object.keys(firstRow);
    
    debugInfo.cmsFirstRowKeys = finalColumns;
    debugInfo.cmsSampleRow = sanitizeSampleRow(firstRow);
    
    // Choose name field (prefer Gnrc_Name, fallback to Brnd_Name)
    const nameField = chooseNameField(finalColumns);
    debugInfo.chosenNameField = nameField || undefined;
    
    // Choose exposure field if not already determined
    if (!exposureField || finalColumns.length === 0) {
      const exposureResult = chooseExposureField(finalColumns);
      exposureField = exposureResult.field;
      exposureType = exposureResult.type;
      exposureYear = exposureResult.year;
    }
    
    debugInfo.chosenExposureField = exposureField || undefined;
    debugInfo.chosenYear = exposureYear || undefined;
    debugInfo.exposureType = exposureType;
    
    if (!nameField || !exposureField) {
      debugInfo.fetchErrorStage = 'cms_data';
      throw new Error(
        `Could not identify required fields. Name field: ${nameField || 'not found'}. ` +
        `Exposure field: ${exposureField || 'not found'}. Available columns: ${finalColumns.join(', ')}`
      );
    }
    
    // If we only fetched 1 row to get columns, now fetch the full sorted dataset
    if (data.length === 1 && exposureField) {
      const fullDataUrl = `${CMS_DATA_URL}?size=5000&sort=-${encodeURIComponent(exposureField)}`;
      debugInfo.cmsRequestUrl = fullDataUrl;
      
      console.error('[data-signals-exposure]', {
        step: 'fetching CMS data (full sorted)',
        url: fullDataUrl,
        timestamp: new Date().toISOString(),
      });
      
      const fullController = new AbortController();
      const fullTimeoutId = setTimeout(() => fullController.abort(), FETCH_TIMEOUT_MS);
      
      try {
        const fullResponse = await fetch(fullDataUrl, {
          headers: {
            'User-Agent': 'MedSafe Project (https://medsafeproject.org)',
          },
          signal: fullController.signal,
        });
        
        clearTimeout(fullTimeoutId);
        
        if (!fullResponse.ok) {
          throw new Error(`CMS API error: ${fullResponse.status} ${fullResponse.statusText}`);
        }
        
        data = await fullResponse.json();
        
        if (!Array.isArray(data) || data.length === 0) {
          throw new Error('CMS API returned empty data on full fetch');
        }
      } catch (error) {
        clearTimeout(fullTimeoutId);
        // Fall back to original data if full fetch fails
        console.error('[data-signals-exposure]', {
          step: 'full fetch failed, using sample',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
    
    // Filter rows: if Mftr_Name exists, keep only rows where Mftr_Name case-insensitive === "Overall"
    let filteredData = data;
    const mftrField = finalColumns.find(c => c === 'Mftr_Name' || c.toLowerCase() === 'mftr_name');
    if (mftrField) {
      const overallRows = data.filter((row: unknown) => {
        const rowObj = row as Record<string, unknown>;
        const mftrValue = rowObj[mftrField];
        return mftrValue && String(mftrValue).trim().toLowerCase() === 'overall';
      });
      
      // Use filtered rows if we have any, otherwise fall back to all rows
      if (overallRows.length > 0) {
        filteredData = overallRows;
      }
    }
    
    // Track filtered out counts for debug
    const filteredOutCounts = {
      needles: 0,
      vaccines: 0,
      pref: 0,
      empty: 0,
      commasOrSlashes: 0,
    };
    
    // Helper to normalize name for aggregation (uppercase, collapse whitespace)
    function normalizeForAggregation(name: string): string {
      return name.toUpperCase().replace(/\s+/g, ' ').trim();
    }
    
    // Helper to check if name should be excluded from topList
    function shouldExcludeFromTopList(name: string): boolean {
      const upper = name.toUpperCase();
      if (upper.includes('NEEDLE') || upper.includes('SYRING') || upper.includes('PENTIPS') || upper.includes('PEN NEEDLE')) {
        filteredOutCounts.needles++;
        return true;
      }
      if (upper.includes('VACC') || upper.includes('VACCINE')) {
        filteredOutCounts.vaccines++;
        return true;
      }
      if (upper.includes('PREF')) {
        filteredOutCounts.pref++;
        return true;
      }
      if (!name || name.trim() === '') {
        filteredOutCounts.empty++;
        return true;
      }
      if (name.includes(',') || name.includes('/')) {
        filteredOutCounts.commasOrSlashes++;
        return true;
      }
      return false;
    }
    
    // Parse and aggregate data
    // Map: normalizedName -> { displayName (raw), exposureCount }
    const drugMap = new Map<string, { displayName: string; exposureCount: number }>();
    
    for (const row of filteredData) {
      const rowObj = row as Record<string, unknown>;
      
      // Prefer Gnrc_Name, fallback to Brnd_Name
      let nameValue = rowObj[nameField];
      if (!nameValue && nameField === 'Gnrc_Name') {
        const brndField = finalColumns.find(c => c === 'Brnd_Name');
        if (brndField) {
          nameValue = rowObj[brndField];
        }
      }
      
      const exposureValue = rowObj[exposureField];
      
      if (!nameValue || !exposureValue) continue;
      
      // Get raw name for display
      const rawName = typeof nameValue === 'string' ? nameValue.trim() : String(nameValue).trim();
      if (!rawName) continue;
      
      // Normalize for aggregation (uppercase, collapse whitespace)
      const normalizedName = normalizeForAggregation(rawName);
      if (!normalizedName) continue;
      
      // Parse exposure count
      let exposureCount = 0;
      if (typeof exposureValue === 'number') {
        exposureCount = exposureValue;
      } else if (typeof exposureValue === 'string') {
        exposureCount = parseFloat(exposureValue.replace(/,/g, ''));
      }
      
      if (isNaN(exposureCount) || exposureCount <= 0) continue;
      
      // Aggregate: sum exposure counts for same normalized name
      const existing = drugMap.get(normalizedName);
      if (existing) {
        drugMap.set(normalizedName, {
          displayName: existing.displayName, // Keep first displayName encountered
          exposureCount: existing.exposureCount + Math.round(exposureCount),
        });
      } else {
        drugMap.set(normalizedName, {
          displayName: rawName, // Store raw name for display
          exposureCount: Math.round(exposureCount),
        });
      }
    }
    
    if (drugMap.size === 0) {
      debugInfo.fetchErrorStage = 'cms_data';
      throw new Error('Could not extract drug names or exposure counts from CMS data');
    }
    
    // Filter out junk for topList (but keep in aggregation for exposure counts)
    // Convert map to array, filter, then sort by exposure count descending
    const topList: TopDrugItem[] = Array.from(drugMap.entries())
      .filter(([normalizedName, { displayName }]) => {
        // Exclude from topList if it contains junk
        return !shouldExcludeFromTopList(displayName);
      })
      .map(([normalizedName, { displayName, exposureCount }]) => ({
        drugName: displayName, // Use raw displayName for UI
        exposureCount,
      }))
      .sort((a, b) => b.exposureCount - a.exposureCount)
      .slice(0, 50); // Top 50
    
    // Defensive check: if topList is empty, return empty result
    if (!topList.length) {
      debugInfo.fetchErrorStage = 'cms_data';
      throw new Error('CMS data parsed but resulted in empty top list after filtering');
    }
    
    debugInfo.topListPreview = topList.slice(0, 10);
    debugInfo.topListFirst10 = topList.slice(0, 10);
    debugInfo.filteredOutCounts = filteredOutCounts;
    debugInfo.cmsUsedYear = exposureYear || undefined;
    debugInfo.cmsExposureField = exposureField || undefined;
    debugInfo.cmsNameField = nameField || undefined;
    
    const result = { topList, exposureType };
    
    // Cache the result (only if not debug and not refresh)
    if (!debug && !refresh) {
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

async function fetchFaersCount(drugName: string, days: number = 365, debug: boolean = false, refresh: boolean = false): Promise<{ count: number; debugInfo?: DebugInfo }> {
  const debugInfo: DebugInfo = {};
  
  // Normalize name for FAERS querying
  const { displayName, queryName } = normalizeCmsNameForFaers(drugName);
  const normalizedForRxNorm = normalizeForRxNorm(drugName)[0];
  
  // Store debug info
  if (debug) {
    debugInfo.selectedDrugRaw = drugName;
    debugInfo.selectedDrugNormalized = normalizedForRxNorm;
    debugInfo.selectedDrugQueryName = queryName;
    debugInfo.faersAttemptedQueries = [];
  }
  
  const { start, end } = getDateRange(days);
  
  // Step 1: Try to resolve RxCUI
  let rxcui: string | null = null;
  try {
    rxcui = await resolveRxcui(drugName, debug);
    if (debug) {
      debugInfo.resolvedRxcui = rxcui;
    }
  } catch (error) {
    if (debug) {
      debugInfo.faersAttemptedQueries!.push({
        label: 'rxcui_resolution',
        url: 'RxNorm API',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
  
  // Step 2: If we have RxCUI, query FAERS with RxCUI first
  if (rxcui) {
    const cacheKey = `faers:${CACHE_VERSION}:${rxcui}:${days}`;
    
    // Check cache (skip if debug or refresh)
    if (!debug && !refresh) {
      const cached = faersCache.get(cacheKey);
      if (cached && Date.now() < cached.expiresAt) {
        const count = cached.data as number;
        if (debug) {
          debugInfo.cacheHit = { faers: true };
        }
        debugInfo.faersStrategyUsed = 'rxcui';
        debugInfo.faersTotal = count;
        return { count, debugInfo: debug ? debugInfo : undefined };
      }
    }
    
    const url = buildFaersUrl(start, end, 'rxcui', rxcui);
    
    if (debug) {
      debugInfo.faersSearchUrlUsed = url;
    }
    
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
      
      if (debug) {
        debugInfo.faersStatus = response.status;
        debugInfo.faersFinalUrlUsed = url;
      }
      
      if (response.ok) {
        const data = await response.json();
        
        // Parse count from openFDA meta.results.total (NO count= parameter used)
        const total = Number(data?.meta?.results?.total ?? 0);
        
        if (debug) {
          debugInfo.faersTotalParsed = total;
          debugInfo.faersAttemptedQueries!.push({
            label: 'rxcui',
            url,
            total,
          });
          debugInfo.faersChosen = { label: 'rxcui', total };
        }
        
        debugInfo.faersStrategyUsed = 'rxcui';
        debugInfo.faersTotal = total;
        
        // Cache the result (only if not debug and not refresh)
        if (!debug && !refresh) {
          faersCache.set(cacheKey, {
            data: total,
            expiresAt: Date.now() + CACHE_TTL_MS,
          });
        }
        
        console.error('[data-signals-exposure]', {
          step: 'FAERS count fetched (RxCUI)',
          drugName,
          rxcui,
          count: total,
          timestamp: new Date().toISOString(),
        });
        
        return { count: total, debugInfo: debug ? debugInfo : undefined };
      } else {
        // Non-200 response
        if (debug) {
          const responseText = await response.text().catch(() => '');
          const errorText = responseText.substring(0, 500);
          debugInfo.faersErrorText = errorText;
          debugInfo.faersAttemptedQueries!.push({
            label: 'rxcui',
            url,
            error: `${response.status} ${response.statusText}`,
          });
        }
        // Fall through to name-based fallback
      }
    } catch (error) {
      clearTimeout(timeoutId);
      if (debug) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        debugInfo.faersErrorText = errorMessage.substring(0, 500);
        debugInfo.faersAttemptedQueries!.push({
          label: 'rxcui',
          url,
          error: errorMessage,
        });
      }
      // Fall through to name-based fallback
    }
  }
  
  // Step 3: Fallback to name-based queries if RxCUI failed or was null
  debugInfo.faersStrategyUsed = 'name-fallback';
  
  // Check cache for name-based query (skip if debug or refresh)
  const nameCacheKey = `faers:${CACHE_VERSION}:name:${queryName}:${days}`;
  if (!debug && !refresh) {
    const cached = faersCache.get(nameCacheKey);
    if (cached && Date.now() < cached.expiresAt) {
      const count = cached.data as number;
      if (debug) {
        debugInfo.cacheHit = { faers: true };
      }
      debugInfo.faersTotal = count;
      return { count, debugInfo: debug ? debugInfo : undefined };
    }
  }
  
  // Define query attempts in order of preference
  const attempts: Array<{ label: string; type: 'generic_exact' | 'brand_exact' | 'medicinalproduct'; drug: string }> = [
    { label: 'generic_name.exact', type: 'generic_exact', drug: queryName },
    { label: 'brand_name.exact', type: 'brand_exact', drug: queryName },
    { label: 'medicinalproduct', type: 'medicinalproduct', drug: queryName },
  ];
  
  let chosenAttempt: { label: string; total: number } | null = null;
  
  // Try each attempt in order
  for (const attempt of attempts) {
    const url = buildFaersUrl(start, end, attempt.type, attempt.drug);
    
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
      
      if (debug) {
        debugInfo.faersStatus = response.status;
        if (!debugInfo.faersFinalUrlUsed) {
          debugInfo.faersFinalUrlUsed = url;
        }
      }
      
      if (!response.ok) {
        // 404 means no results, treat as 0 and continue to next attempt
        if (response.status === 404) {
          if (debug) {
            debugInfo.faersTotalParsed = 0;
            debugInfo.faersAttemptedQueries!.push({
              label: attempt.label,
              url,
              total: 0,
            });
          }
          continue; // Try next attempt
        }
        
        // Other errors: record and continue
        const responseText = await response.text().catch(() => '');
        const errorText = responseText.substring(0, 500);
        
        if (debug) {
          debugInfo.faersErrorText = errorText;
          debugInfo.faersAttemptedQueries!.push({
            label: attempt.label,
            url,
            error: `${response.status} ${response.statusText}`,
          });
        }
        
        console.error('[data-signals-exposure]', {
          step: 'FAERS API error (continuing)',
          attempt: attempt.label,
          drugName,
          status: response.status,
          timestamp: new Date().toISOString(),
        });
        
        continue; // Try next attempt
      }
      
      const data = await response.json();
      
      // Parse count from openFDA meta.results.total (NO count= parameter used)
      const total = Number(data?.meta?.results?.total ?? 0);
      
      if (debug) {
        debugInfo.faersTotalParsed = total;
        debugInfo.faersAttemptedQueries!.push({
          label: attempt.label,
          url,
          total,
        });
      }
      
      // If we got a non-zero result, use it and stop
      if (total > 0) {
        chosenAttempt = { label: attempt.label, total };
        if (!debugInfo.faersSearchUrlUsed) {
          debugInfo.faersSearchUrlUsed = url;
        }
        debugInfo.faersFinalUrlUsed = url;
        break; // Found a match, stop trying
      }
      
      // If count is 0, continue to next attempt
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        if (debug) {
          debugInfo.faersAttemptedQueries!.push({
            label: attempt.label,
            url,
            error: `Timeout after ${FETCH_TIMEOUT_MS}ms`,
          });
        }
        // Continue to next attempt on timeout
        continue;
      }
      
      // Other errors: record and continue (don't throw)
      if (debug) {
        debugInfo.faersAttemptedQueries!.push({
          label: attempt.label,
          url,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
      
      // Continue to next attempt (errors treated as 0)
      continue;
    }
  }
  
  // Use the chosen attempt's count, or 0 if all attempts failed
  const count = chosenAttempt?.total || 0;
  
  if (debug && chosenAttempt) {
    debugInfo.faersChosen = chosenAttempt;
  }
  
  if (debug && !debugInfo.faersTotalParsed && count === 0) {
    debugInfo.faersTotalParsed = 0;
  }
  
  debugInfo.faersRawCount = count;
  debugInfo.faersTotal = count;
  
  // Cache the result (only if not debug and not refresh) - cache by queryName
  if (!debug && !refresh) {
    faersCache.set(nameCacheKey, {
      data: count,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });
  }
  
  console.error('[data-signals-exposure]', {
    step: 'FAERS count fetched',
    drugName,
    queryName,
    rxcui: rxcui || 'none',
    count,
    strategy: debugInfo.faersStrategyUsed,
    chosenAttempt: chosenAttempt?.label || 'none',
    timestamp: new Date().toISOString(),
  });
  
  return { count, debugInfo: debug ? debugInfo : undefined };
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
  const refresh = event.queryStringParameters?.refresh === '1';
  const timeWindowDays = 365;

  try {
    // Fetch CMS top list
    const cmsResult = await fetchCmsTopList(debug, refresh);
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
    
    // Fetch FAERS count (normalization happens inside fetchFaersCount)
    const faersResult = await fetchFaersCount(selectedDrugName, timeWindowDays, debug, refresh);
    const { count: faersReports, debugInfo: faersDebugInfo } = faersResult;
    
    // Calculate rate per 100k
    const ratePer100k = selectedDrug.exposureCount > 0
      ? (faersReports / selectedDrug.exposureCount) * 100000
      : 0;
    
    // Use displayName from normalization (which is the raw CMS name)
    const { displayName } = normalizeCmsNameForFaers(selectedDrug.drugName);
    
    const item: SignalExposureItem = {
      drugName: displayName, // Use displayName (raw CMS name) for UI
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
        cacheBypassed: refresh || cmsDebugInfo?.cacheBypassed || false,
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
