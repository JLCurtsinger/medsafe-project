import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

interface Cluster {
  id: string;
  label: string;
  count: number;
  terms: string[];
}

interface InteractionClustersResponse {
  generatedAt: string;
  source: string;
  labelCount: number;
  clusters: Cluster[];
}

interface CacheEntry {
  data: InteractionClustersResponse;
  expiresAt: number;
}

// Cache version for cache busting on deploys
const CACHE_VERSION = 'v1';

// In-memory cache with TTL (12 hours)
let cache: CacheEntry | null = null;
const CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours
const FETCH_TIMEOUT_MS = 15000; // 15 seconds

// Dictionary-based concept extractor patterns
// Each cluster has an ID, label, and array of search patterns (case-insensitive)
const CLUSTER_PATTERNS: Array<{ id: string; label: string; patterns: string[] }> = [
  {
    id: 'bleeding',
    label: 'Bleeding Risk',
    patterns: [
      'bleeding', 'hemorrhage', 'hemorrhagic', 'anticoagulant', 'warfarin',
      'blood clotting', 'coagulation', 'platelet', 'thrombosis', 'clotting',
      'aspirin', 'clopidogrel', 'heparin', 'enoxaparin', 'rivaroxaban',
      'apixaban', 'dabigatran', 'edoxaban'
    ]
  },
  {
    id: 'serotonin',
    label: 'Serotonin Syndrome',
    patterns: [
      'serotonin', 'serotonin syndrome', 'ssri', 'sri', 'maoi',
      'tramadol', 'meperidine', 'fentanyl', 'dextromethorphan',
      'triptan', 'sumatriptan', 'linezolid', 'methylene blue'
    ]
  },
  {
    id: 'cns_depression',
    label: 'CNS Depression',
    patterns: [
      'cns depression', 'central nervous system depression', 'sedation',
      'respiratory depression', 'opioid', 'benzodiazepine', 'barbiturate',
      'alcohol', 'ethanol', 'drowsiness', 'somnolence', 'hypnotic',
      'anesthesia', 'anesthetic'
    ]
  },
  {
    id: 'qt_prolongation',
    label: 'QT Prolongation',
    patterns: [
      'qt prolongation', 'qt interval', 'torsades', 'torsade de pointes',
      'arrhythmia', 'cardiac arrhythmia', 'prolonged qt', 'qtc',
      'quinidine', 'sotalol', 'amiodarone', 'dofetilide', 'ibutilide',
      'erythromycin', 'clarithromycin', 'azithromycin', 'levofloxacin',
      'moxifloxacin', 'haloperidol', 'thioridazine', 'ziprasidone'
    ]
  },
  {
    id: 'renal',
    label: 'Renal Impairment',
    patterns: [
      'renal impairment', 'renal function', 'kidney', 'nephrotoxic',
      'nephrotoxicity', 'creatinine', 'glomerular filtration', 'gfr',
      'renal clearance', 'renal failure', 'acute kidney injury', 'aki',
      'chronic kidney disease', 'ckd', 'dialysis'
    ]
  },
  {
    id: 'cyp',
    label: 'CYP Enzyme Interactions',
    patterns: [
      'cyp3a4', 'cyp2d6', 'cyp2c9', 'cyp2c19', 'cyp1a2', 'cyp2b6',
      'cytochrome p450', 'cyp enzyme', 'enzyme inhibitor', 'enzyme inducer',
      'grapefruit', 'ketoconazole', 'itraconazole', 'voriconazole',
      'fluconazole', 'erythromycin', 'clarithromycin', 'rifampin',
      'rifampicin', 'phenytoin', 'carbamazepine', 'phenobarbital'
    ]
  }
];

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

/**
 * Normalize text for pattern matching (lowercase, remove punctuation)
 */
function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[^\w\s]/g, ' ');
}

/**
 * Check if text contains any pattern from a cluster
 */
function matchesCluster(text: string, patterns: string[]): boolean {
  const normalized = normalizeText(text);
  return patterns.some(pattern => {
    const normalizedPattern = normalizeText(pattern);
    // Use word boundary matching for better accuracy
    const regex = new RegExp(`\\b${normalizedPattern.replace(/\s+/g, '\\s+')}\\b`, 'i');
    return regex.test(normalized);
  });
}

/**
 * Extract top matching terms for a cluster from text
 */
function extractTopTerms(text: string, patterns: string[], maxTerms: number = 5): string[] {
  const normalized = normalizeText(text);
  const matchedTerms: string[] = [];
  
  for (const pattern of patterns) {
    const normalizedPattern = normalizeText(pattern);
    const regex = new RegExp(`\\b${normalizedPattern.replace(/\s+/g, '\\s+')}\\b`, 'gi');
    if (regex.test(normalized)) {
      matchedTerms.push(pattern);
      if (matchedTerms.length >= maxTerms) {
        break;
      }
    }
  }
  
  return matchedTerms;
}

function buildOpenFdaUrl(limit: number = 300): string {
  const baseUrl = 'https://api.fda.gov/drug/label.json';
  // Search for labels that have drug_interactions or warnings_and_precautions
  const searchQuery = '(_exists_:drug_interactions OR _exists_:warnings_and_precautions)';
  const params = new URLSearchParams({
    search: searchQuery,
    limit: limit.toString()
  });
  return `${baseUrl}?${params.toString()}`;
}

async function fetchInteractionClustersData(debug: boolean = false): Promise<InteractionClustersResponse> {
  const openFdaRequestUrl = buildOpenFdaUrl(300);
  
  console.error('[data-interaction-clusters]', {
    step: 'fetching openFDA',
    openFdaRequestUrl,
    timestamp: new Date().toISOString()
  });
  
  // Create AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  
  try {
    const response = await fetch(openFdaRequestUrl, {
      headers: {
        'User-Agent': 'MedSafe Project (https://medsafeproject.org)'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const responseText = await response.text();
      const snippet = responseText.substring(0, 200);
      console.error('[data-interaction-clusters]', {
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
    
    const data = await response.json();
    
    if (!data.results || !Array.isArray(data.results)) {
      throw new Error('Invalid response format from openFDA API: results is not an array');
    }
    
    console.error('[data-interaction-clusters]', {
      step: 'processing labels',
      fetchedCount: data.results.length,
      timestamp: new Date().toISOString()
    });
    
    // Initialize cluster counts and term sets
    const clusterCounts = new Map<string, number>();
    const clusterTerms = new Map<string, Set<string>>();
    
    // Initialize all clusters
    for (const cluster of CLUSTER_PATTERNS) {
      clusterCounts.set(cluster.id, 0);
      clusterTerms.set(cluster.id, new Set<string>());
    }
    
    // Process each label
    for (const label of data.results) {
      // Prefer drug_interactions, fallback to warnings_and_precautions
      let interactionText = extractFieldText(label.drug_interactions);
      if (!interactionText) {
        interactionText = extractFieldText(label.warnings_and_precautions);
      }
      
      if (!interactionText) {
        continue; // Skip labels without interaction data
      }
      
      // Check each cluster
      for (const cluster of CLUSTER_PATTERNS) {
        if (matchesCluster(interactionText, cluster.patterns)) {
          // Increment count
          const currentCount = clusterCounts.get(cluster.id) || 0;
          clusterCounts.set(cluster.id, currentCount + 1);
          
          // Extract top terms
          const terms = extractTopTerms(interactionText, cluster.patterns, 5);
          const termSet = clusterTerms.get(cluster.id) || new Set<string>();
          for (const term of terms) {
            termSet.add(term);
          }
          clusterTerms.set(cluster.id, termSet);
        }
      }
    }
    
    // Build clusters array
    const clusters: Cluster[] = CLUSTER_PATTERNS.map(cluster => {
      const count = clusterCounts.get(cluster.id) || 0;
      const termSet = clusterTerms.get(cluster.id) || new Set<string>();
      // Convert Set to Array and take top 5
      const terms = Array.from(termSet).slice(0, 5);
      
      return {
        id: cluster.id,
        label: cluster.label,
        count,
        terms
      };
    }).filter(cluster => cluster.count > 0); // Only include clusters with matches
    
    // Sort by count descending
    clusters.sort((a, b) => b.count - a.count);
    
    const result: InteractionClustersResponse = {
      generatedAt: new Date().toISOString(),
      source: 'openFDA drug labels',
      labelCount: data.results.length,
      clusters
    };
    
    console.error('[data-interaction-clusters]', {
      step: 'processing complete',
      labelCount: data.results.length,
      clusterCount: clusters.length,
      timestamp: new Date().toISOString()
    });
    
    return result;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('[data-interaction-clusters]', {
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
  const refresh = event.queryStringParameters?.refresh === '1';
  
  // Check cache (skip cache if debug or refresh)
  const cacheKey = `${CACHE_VERSION}`;
  if (!debug && !refresh && cache && Date.now() < cache.expiresAt) {
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
    const data = await fetchInteractionClustersData(debug);
    
    // Update cache (only if not debug or refresh mode)
    if (!debug && !refresh) {
      cache = {
        data,
        expiresAt: Date.now() + CACHE_TTL_MS
      };
    }
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': debug ? 'no-cache' : 'public, max-age=3600',
        ...corsHeaders
      },
      body: JSON.stringify(data)
    };
  } catch (error) {
    const errorName = error instanceof Error ? error.name : 'Unknown';
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('[data-interaction-clusters]', {
      step: 'handler error',
      errorName,
      errorMessage,
      errorStack,
      timestamp: new Date().toISOString()
    });
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      },
      body: JSON.stringify({
        error: 'data-interaction-clusters failed',
        details: `${errorName}: ${errorMessage}`,
        generatedAt: new Date().toISOString()
      })
    };
  }
};

