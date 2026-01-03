import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

interface WordCloudTerm {
  name: string;
  value: number;
}

interface WordCloudResponse {
  generatedAt: string;
  source: string;
  terms: WordCloudTerm[];
  // Debug fields (only when debug=1)
  fetchedCount?: number;
  corpusCharCount?: number;
  uniqueTokenCount?: number;
  topTokensPreview?: WordCloudTerm[];
  openFdaRequestUrl?: string;
  debug?: { mode: string };
}

interface CacheEntry {
  data: WordCloudResponse;
  expiresAt: number;
}

// In-memory cache with TTL (6 hours)
let cache: CacheEntry | null = null;
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
const FETCH_TIMEOUT_MS = 10000; // 10 seconds

// Domain-specific terms that should be boosted
const DOMAIN_BOOST_TERMS = new Set([
  'cyp3a4', 'cyp2d6', 'qt', 'bleeding', 'serotonin', 'sedation',
  'respiratory', 'hypotension', 'hepatotoxicity', 'nephrotoxic',
  'warfarin', 'grapefruit', 'alcohol', 'opioid', 'maoi'
]);

// Basic English stopwords + domain filler words
const STOPWORDS = new Set([
  // Common English stopwords
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
  'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
  'should', 'could', 'may', 'might', 'must', 'can', 'this', 'that',
  'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
  'when', 'where', 'which', 'who', 'what', 'how', 'why', 'if', 'then', 'else',
  'also', 'other', 'more', 'most', 'some', 'any', 'all', 'each',
  'every', 'both', 'either', 'neither', 'one', 'two', 'three', 'first',
  'second', 'third', 'last', 'next', 'previous', 'new', 'old', 'same',
  'different', 'such', 'than', 'too', 'very', 'so', 'just', 'only',
  'even', 'still', 'yet', 'already', 'again', 'once', 'twice', 'here',
  'there', 'everywhere', 'nowhere', 'somewhere', 'anywhere',
  'up', 'down', 'out', 'off', 'over', 'under', 'above', 'below',
  'between', 'among', 'through', 'during', 'before', 'after', 'while',
  'since', 'until', 'about', 'against', 'into', 'onto', 'upon', 'within',
  'without', 'across', 'around', 'behind', 'beside', 'beyond', 'near',
  'far', 'away', 'back', 'forward', 'ahead', 'together', 'apart',
  'alone', 'along', 'besides', 'except',
  // Domain-specific filler words
  'patients', 'patient', 'use', 'mg', 'tablet', 'dose', 'dosing',
  'treatment', 'clinical', 'studies', 'study', 'including',
  'include', 'includes', 'drug', 'drugs', 'medication', 'medications',
  'interaction', 'interactions', 'adverse', 'effects', 'effect',
  'reaction', 'reactions'
]);

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Replace punctuation with space
    .replace(/\s+/g, ' ') // Collapse whitespace
    .trim();
}

function extractTokens(text: string): string[] {
  const normalized = normalizeText(text);
  return normalized
    .split(/\s+/)
    .filter(token => token.length >= 3)
    .filter(token => !STOPWORDS.has(token));
}

function processText(text: string): Map<string, number> {
  const tokens = extractTokens(text);
  const frequencies = new Map<string, number>();
  
  for (const token of tokens) {
    const count = frequencies.get(token) || 0;
    frequencies.set(token, count + 1);
  }
  
  return frequencies;
}

function mergeFrequencies(...maps: Map<string, number>[]): Map<string, number> {
  const merged = new Map<string, number>();
  
  for (const map of maps) {
    for (const [token, count] of map.entries()) {
      const existing = merged.get(token) || 0;
      merged.set(token, existing + count);
    }
  }
  
  return merged;
}

function getTopTerms(frequencies: Map<string, number>, topN: number = 80): WordCloudTerm[] {
  // Boost domain-specific terms
  const boosted = new Map<string, number>();
  
  for (const [token, count] of frequencies.entries()) {
    if (DOMAIN_BOOST_TERMS.has(token)) {
      boosted.set(token, count * 1.5); // Boost by 50%
    } else {
      boosted.set(token, count);
    }
  }
  
  // Sort by frequency (descending)
  const sorted = Array.from(boosted.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN);
  
  return sorted.map(([name, value]) => ({ name, value: Math.round(value) }));
}

/**
 * Helper to extract text from openFDA field data
 * Handles: string, array of strings, or missing/null/undefined
 */
function extractFieldText(fieldData: unknown): string {
  if (typeof fieldData === 'string') {
    return fieldData;
  }
  if (Array.isArray(fieldData)) {
    return fieldData
      .filter(item => typeof item === 'string')
      .join('\n');
  }
  return '';
}

function buildOpenFdaUrl(searchQuery: string, limit: number = 200): string {
  const baseUrl = 'https://api.fda.gov/drug/label.json';
  const params = new URLSearchParams({
    search: searchQuery,
    limit: limit.toString()
  });
  return `${baseUrl}?${params.toString()}`;
}

async function fetchWordCloudData(debug: boolean = false): Promise<WordCloudResponse> {
  const fields = [
    'drug_interactions',
    'warnings',
    'contraindications',
    'boxed_warning',
    'warnings_and_precautions'
  ];
  
  // Build safer search query using OR across multiple fields
  const searchQuery = `(_exists_:drug_interactions OR _exists_:warnings OR _exists_:contraindications OR _exists_:boxed_warning OR _exists_:warnings_and_precautions)`;
  const openFdaRequestUrl = buildOpenFdaUrl(searchQuery, 200);
  
  console.error('[data-wordcloud]', {
    step: 'fetching openFDA',
    openFdaRequestUrl,
    timestamp: new Date().toISOString()
  });
  
  // Create AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  
  let response: Response;
  let responseText: string = '';
  
  try {
    response = await fetch(openFdaRequestUrl, {
      headers: {
        'User-Agent': 'MedSafe Project (https://medsafeproject.org)'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      responseText = await response.text();
      const snippet = responseText.substring(0, 200);
      console.error('[data-wordcloud]', {
        step: 'openFDA error response',
        status: response.status,
        statusText: response.statusText,
        snippet,
        openFdaRequestUrl,
        timestamp: new Date().toISOString()
      });
      throw new Error(
        `openFDA API error: ${response.status} ${response.statusText}. Response: ${snippet}`
      );
    }
    
    console.error('[data-wordcloud]', {
      step: 'parsing JSON',
      openFdaRequestUrl,
      timestamp: new Date().toISOString()
    });
    
    const data = await response.json();
    
    if (!data.results || !Array.isArray(data.results)) {
      throw new Error('Invalid response format from openFDA API: results is not an array');
    }
    
    console.error('[data-wordcloud]', {
      step: 'tokenizing',
      fetchedCount: data.results.length,
      openFdaRequestUrl,
      timestamp: new Date().toISOString()
    });
    
    const allFrequencies = new Map<string, number>();
    let corpusCharCount = 0;
    
    for (const label of data.results) {
      const labelFrequencies: Map<string, number>[] = [];
      
      for (const field of fields) {
        const fieldData = label[field];
        const fieldText = extractFieldText(fieldData);
        
        if (fieldText) {
          corpusCharCount += fieldText.length;
          labelFrequencies.push(processText(fieldText));
        }
      }
      
      if (labelFrequencies.length > 0) {
        const merged = mergeFrequencies(...labelFrequencies);
        for (const [token, count] of merged.entries()) {
          const existing = allFrequencies.get(token) || 0;
          allFrequencies.set(token, existing + count);
        }
      }
    }
    
    const terms = getTopTerms(allFrequencies, 80);
    const uniqueTokenCount = allFrequencies.size;
    
    const result: WordCloudResponse = {
      generatedAt: new Date().toISOString(),
      source: 'openFDA drug labels',
      terms
    };
    
    if (debug) {
      result.fetchedCount = data.results.length;
      result.corpusCharCount = corpusCharCount;
      result.uniqueTokenCount = uniqueTokenCount;
      result.topTokensPreview = terms.slice(0, 10);
      result.openFdaRequestUrl = openFdaRequestUrl;
    }
    
    return result;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('[data-wordcloud]', {
        step: 'timeout',
        openFdaRequestUrl,
        timeoutMs: FETCH_TIMEOUT_MS,
        timestamp: new Date().toISOString()
      });
      throw new Error(`openFDA API request timed out after ${FETCH_TIMEOUT_MS}ms`);
    }
    
    throw error;
  }
}

// CORS headers helper
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

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
        ...corsHeaders
      },
      body: JSON.stringify({})
    };
  }

  const debug = event.queryStringParameters?.debug === '1';
  const selftest = event.queryStringParameters?.selftest === '1';
  const ping = event.queryStringParameters?.ping === '1';
  
  const searchQuery = `(_exists_:drug_interactions OR _exists_:warnings OR _exists_:contraindications OR _exists_:boxed_warning OR _exists_:warnings_and_precautions)`;
  const openFdaRequestUrl = buildOpenFdaUrl(searchQuery, 200);

  // SELFTEST MODE: Return deterministic data without calling openFDA
  if (selftest) {
    console.error('[data-wordcloud]', {
      step: 'selftest mode',
      timestamp: new Date().toISOString()
    });
    
    const selftestData: WordCloudResponse = {
      generatedAt: new Date().toISOString(),
      source: 'selftest',
      terms: [
        { name: 'interaction', value: 42 },
        { name: 'bleeding', value: 18 },
        { name: 'cyp3a4', value: 12 }
      ],
      debug: { mode: 'selftest' }
    };
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      },
      body: JSON.stringify(selftestData)
    };
  }

  // PING MODE: Test openFDA connectivity with minimal request
  if (ping) {
    console.error('[data-wordcloud]', {
      step: 'ping mode - testing openFDA connectivity',
      timestamp: new Date().toISOString()
    });
    
    const pingUrl = buildOpenFdaUrl('', 1); // Empty search, limit 1
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
      
      const response = await fetch(pingUrl, {
        headers: {
          'User-Agent': 'MedSafe Project (https://medsafeproject.org)'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const responseText = await response.text();
        const snippet = responseText.substring(0, 200);
        console.error('[data-wordcloud]', {
          step: 'ping failed',
          status: response.status,
          statusText: response.statusText,
          snippet,
          openFdaRequestUrl: pingUrl,
          timestamp: new Date().toISOString()
        });
        
        return {
          statusCode: 502,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          },
          body: JSON.stringify({
            ok: false,
            status: response.status,
            details: `openFDA ping failed: ${response.status} ${response.statusText}. Response: ${snippet}`,
            openFdaRequestUrl: pingUrl,
            generatedAt: new Date().toISOString()
          })
        };
      }
      
      const data = await response.json();
      const count = data.results ? data.results.length : 0;
      
      console.error('[data-wordcloud]', {
        step: 'ping succeeded',
        status: response.status,
        fetched: count,
        openFdaRequestUrl: pingUrl,
        timestamp: new Date().toISOString()
      });
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        },
        body: JSON.stringify({
          ok: true,
          status: response.status,
          fetched: count,
          openFdaRequestUrl: pingUrl,
          generatedAt: new Date().toISOString()
        })
      };
    } catch (error) {
      const errorName = error instanceof Error ? error.name : 'Unknown';
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      console.error('[data-wordcloud]', {
        step: 'ping error',
        errorName,
        errorMessage,
        openFdaRequestUrl: pingUrl,
        timestamp: new Date().toISOString()
      });
      
      return {
        statusCode: 502,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        },
        body: JSON.stringify({
          ok: false,
          status: 0,
          details: `${errorName}: ${errorMessage}`,
          openFdaRequestUrl: pingUrl,
          generatedAt: new Date().toISOString()
        })
      };
    }
  }

  // Check cache (skip cache if debug mode)
  if (!debug && cache && Date.now() < cache.expiresAt) {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600', // 1 hour browser cache
        ...corsHeaders
      },
      body: JSON.stringify(cache.data)
    };
  }
  
  try {
    const data = await fetchWordCloudData(debug);
    
    // Update cache (only if not debug mode)
    if (!debug) {
      cache = {
        data,
        expiresAt: Date.now() + CACHE_TTL_MS
      };
    }
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600',
        ...corsHeaders
      },
      body: JSON.stringify(data)
    };
  } catch (error) {
    // Structured error logging
    const errorName = error instanceof Error ? error.name : 'Unknown';
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    // Try to extract response snippet if available
    let responseSnippet = '';
    if (error instanceof Error && error.message.includes('Response:')) {
      const match = error.message.match(/Response:\s*(.{0,200})/);
      if (match) {
        responseSnippet = match[1];
      }
    }
    
    const details = `${errorName}: ${errorMessage}${responseSnippet ? `. Response snippet: ${responseSnippet}` : ''}`;
    
    console.error('[data-wordcloud]', {
      step: 'handler error',
      errorName,
      errorMessage,
      errorStack,
      responseSnippet: responseSnippet || undefined,
      openFdaRequestUrl,
      timestamp: new Date().toISOString()
    });
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      },
      body: JSON.stringify({
        error: 'data-wordcloud failed',
        details: details.substring(0, 200), // Limit details length
        generatedAt: new Date().toISOString(),
        openFdaRequestUrl
      })
    };
  }
};
