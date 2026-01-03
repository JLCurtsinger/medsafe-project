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

interface CacheEntry {
  data: SignalsExposureResponse | { topList: TopDrugItem[] };
  expiresAt: number;
}

// In-memory caches
let cmsTopListCache: CacheEntry | null = null;
const faersCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
const FETCH_TIMEOUT_MS = 10000; // 10 seconds

const CMS_API_BASE = 'https://data.cms.gov/data-api/v1/dataset/7e0b4365-fd63-4a29-8f5e-e0ac9f66a81b/data';
const OPENFDA_API_BASE = 'https://api.fda.gov/drug/event.json';

// CORS headers helper
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function buildCmsUrl(size: number = 50): string {
  const params = new URLSearchParams({
    size: size.toString(),
    sort: '-total_claim_count', // Try descending by claim count first
  });
  return `${CMS_API_BASE}?${params.toString()}`;
}

function buildFaersUrl(drugName: string, startDate: string, endDate: string): string {
  const searchQuery = `receivedate:[${startDate}+TO+${endDate}]+AND+patient.drug.medicinalproduct:"${drugName}"`;
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

function extractDrugName(row: Record<string, unknown>): string | null {
  // Try likely field names in order
  const candidates = [
    'generic_name',
    'brand_name',
    'drug_name',
    'medication_name',
    'name',
  ];
  
  for (const field of candidates) {
    const value = row[field];
    if (typeof value === 'string' && value.trim()) {
      return value.trim().toUpperCase();
    }
  }
  
  return null;
}

function extractExposureCount(row: Record<string, unknown>): { count: number; type: 'beneficiaries' | 'claims' } | null {
  // Try beneficiaries fields first
  const beneficiaryFields = [
    'total_beneficiaries',
    'tot_benes',
    'beneficiary_count',
    'bene_count',
    'beneficiaries',
    'total_benes',
  ];
  
  for (const field of beneficiaryFields) {
    const value = row[field];
    if (typeof value === 'number' && value > 0) {
      return { count: value, type: 'beneficiaries' };
    }
    // Try parsing string numbers
    if (typeof value === 'string') {
      const parsed = parseFloat(value.replace(/,/g, ''));
      if (!isNaN(parsed) && parsed > 0) {
        return { count: parsed, type: 'beneficiaries' };
      }
    }
  }
  
  // Fall back to claim count fields
  const claimFields = [
    'total_claim_count',
    'tot_claim_cnt',
    'total_claims',
    'claim_count',
    'claims',
  ];
  
  for (const field of claimFields) {
    const value = row[field];
    if (typeof value === 'number' && value > 0) {
      return { count: value, type: 'claims' };
    }
    if (typeof value === 'string') {
      const parsed = parseFloat(value.replace(/,/g, ''));
      if (!isNaN(parsed) && parsed > 0) {
        return { count: parsed, type: 'claims' };
      }
    }
  }
  
  return null;
}

async function fetchCmsTopList(): Promise<{ topList: TopDrugItem[]; exposureType: 'beneficiaries' | 'claims' }> {
  // Check cache
  if (cmsTopListCache && Date.now() < cmsTopListCache.expiresAt) {
    const cached = cmsTopListCache.data as { topList: TopDrugItem[]; exposureType: 'beneficiaries' | 'claims' };
    return cached;
  }
  
  console.error('[data-signals-exposure]', {
    step: 'fetching CMS top list',
    url: buildCmsUrl(50),
    timestamp: new Date().toISOString(),
  });
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  
  try {
    const response = await fetch(buildCmsUrl(50), {
      headers: {
        'User-Agent': 'MedSafe Project (https://medsafeproject.org)',
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const responseText = await response.text();
      const snippet = responseText.substring(0, 200);
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
      throw new Error('CMS API returned empty or invalid data');
    }
    
    const topList: TopDrugItem[] = [];
    let exposureType: 'beneficiaries' | 'claims' = 'claims';
    
    for (const row of data) {
      const drugName = extractDrugName(row);
      const exposure = extractExposureCount(row);
      
      if (drugName && exposure) {
        topList.push({
          drugName,
          exposureCount: exposure.count,
        });
        
        // Use the first row's exposure type for consistency
        if (topList.length === 1) {
          exposureType = exposure.type;
        }
      }
    }
    
    if (topList.length === 0) {
      throw new Error('Could not extract drug names or exposure counts from CMS data');
    }
    
    const result = { topList, exposureType };
    
    // Cache the result
    cmsTopListCache = {
      data: result,
      expiresAt: Date.now() + CACHE_TTL_MS,
    };
    
    console.error('[data-signals-exposure]', {
      step: 'CMS top list fetched',
      count: topList.length,
      exposureType,
      timestamp: new Date().toISOString(),
    });
    
    return result;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`CMS API request timed out after ${FETCH_TIMEOUT_MS}ms`);
    }
    
    throw error;
  }
}

async function fetchFaersCount(drugName: string, days: number = 365): Promise<number> {
  // Check cache
  const cacheKey = `${drugName}:${days}`;
  const cached = faersCache.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.data as number;
  }
  
  const { start, end } = getDateRange(days);
  const url = buildFaersUrl(drugName, start, end);
  
  console.error('[data-signals-exposure]', {
    step: 'fetching FAERS count',
    drugName,
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
      const snippet = responseText.substring(0, 200);
      console.error('[data-signals-exposure]', {
        step: 'FAERS API error',
        drugName,
        status: response.status,
        statusText: response.statusText,
        snippet,
        timestamp: new Date().toISOString(),
      });
      throw new Error(`FAERS API error: ${response.status} ${response.statusText}. Response: ${snippet}`);
    }
    
    const data = await response.json();
    
    // Parse count from openFDA response
    // The count endpoint returns results with count values
    let count = 0;
    
    if (data.results && Array.isArray(data.results) && data.results.length > 0) {
      // Count endpoint returns array of { term: "...", count: N }
      const firstResult = data.results[0];
      if (firstResult.count !== undefined) {
        count = typeof firstResult.count === 'number' ? firstResult.count : parseInt(firstResult.count, 10);
      } else if (firstResult.time !== undefined && firstResult.count !== undefined) {
        // Alternative format
        count = typeof firstResult.count === 'number' ? firstResult.count : parseInt(firstResult.count, 10);
      }
    }
    
    // Cache the result
    faersCache.set(cacheKey, {
      data: count,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });
    
    console.error('[data-signals-exposure]', {
      step: 'FAERS count fetched',
      drugName,
      count,
      timestamp: new Date().toISOString(),
    });
    
    return count;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`FAERS API request timed out after ${FETCH_TIMEOUT_MS}ms`);
    }
    
    throw error;
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
  const timeWindowDays = 365;

  try {
    // Fetch CMS top list
    const { topList, exposureType } = await fetchCmsTopList();
    
    // If no drug specified, return just the top list
    if (!drugName) {
      const response: SignalsExposureResponse = {
        generatedAt: new Date().toISOString(),
        sources: {
          faers: 'openFDA drug/event.json',
          cms: 'data.cms.gov Part D Spending by Drug (dataset 7e0b4365-fd63-4a29-8f5e-e0ac9f66a81b)',
        },
        timeWindowDays,
        exposureType,
        items: [],
        topList,
      };
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600',
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
        }),
      };
    }
    
    // Fetch FAERS count
    const faersReports = await fetchFaersCount(drugName, timeWindowDays);
    
    // Calculate rate per 100k
    const ratePer100k = selectedDrug.exposureCount > 0
      ? (faersReports / selectedDrug.exposureCount) * 100000
      : 0;
    
    const response: SignalsExposureResponse = {
      generatedAt: new Date().toISOString(),
      sources: {
        faers: 'openFDA drug/event.json',
        cms: 'data.cms.gov Part D Spending by Drug (dataset 7e0b4365-fd63-4a29-8f5e-e0ac9f66a81b)',
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
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600',
        ...corsHeaders,
      },
      body: JSON.stringify(response),
    };
  } catch (error) {
    const errorName = error instanceof Error ? error.name : 'Unknown';
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('[data-signals-exposure]', {
      step: 'handler error',
      errorName,
      errorMessage,
      errorStack,
      timestamp: new Date().toISOString(),
    });
    
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
      }),
    };
  }
};

