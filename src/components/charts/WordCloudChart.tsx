import { useEffect, useRef, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import 'echarts-wordcloud';

interface WordCloudTerm {
  name: string;
  value: number;
}

interface WordCloudData {
  generatedAt: string;
  source: string;
  terms: WordCloudTerm[];
}

interface WordCloudChartProps {
  className?: string;
}

// Set to true to enable debug mode in dev (only works when import.meta.env.DEV is true)
const DEBUG = true;

// Set to true to enable selftest mode (bypasses openFDA, returns deterministic data)
const SELFTEST = false;

export function WordCloudChart({ className = '' }: WordCloudChartProps) {
  const [data, setData] = useState<WordCloudData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const chartRef = useRef<ReactECharts>(null);
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotion.current = mediaQuery.matches;

    const handleChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion.current = e.matches;
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        // Add debug/selftest params in dev mode if enabled
        const isDev = import.meta.env.DEV;
        const params = new URLSearchParams();
        if (isDev && DEBUG) {
          params.set('debug', '1');
        }
        if (isDev && SELFTEST) {
          params.set('selftest', '1');
        }
        const queryString = params.toString();
        const fnUrl = `/.netlify/functions/data-wordcloud${queryString ? `?${queryString}` : ''}`;

        const response = await fetch(fnUrl);
        
        if (!response.ok) {
          // Try to get error details from response
          let errorDetails = '';
          try {
            const errorData = await response.json();
            if (errorData.details) {
              errorDetails = `: ${errorData.details}`;
            } else if (errorData.message) {
              errorDetails = `: ${errorData.message}`;
            }
          } catch {
            // If response isn't JSON, use status text
            errorDetails = `: ${response.statusText}`;
          }
          throw new Error(`Failed to fetch data (${response.status})${errorDetails}`);
        }

        // Check content-type to ensure we got JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          // Read a snippet of the response to help debug
          const text = await response.text();
          const snippet = text.substring(0, 100);
          throw new Error(
            `Word cloud API returned non-JSON. Are you running Netlify dev? Try \`npx netlify dev\`. ` +
            `Response preview: ${snippet}...`
          );
        }

        const result = await response.json();
        
        if (cancelled) return;

        if (result.error) {
          // Include details field if present (already implemented)
          const errorMsg = result.details 
            ? `${result.error}: ${result.details}` 
            : (result.message || result.error);
          throw new Error(errorMsg);
        }

        setData(result);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load word cloud data');
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, []);

  const getOption = () => {
    if (!data || !data.terms || data.terms.length === 0) {
      return {};
    }

    return {
      backgroundColor: 'transparent',
      tooltip: {
        show: true,
        trigger: 'item',
        formatter: (params: any) => {
          return `${params.name}<br/>Frequency: ${params.value}`;
        },
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        textStyle: {
          color: '#fff'
        }
      },
      series: [
        {
          type: 'wordCloud',
          gridSize: 8,
          sizeRange: [12, 48],
          rotationRange: [-45, 45],
          rotationStep: 5,
          shape: 'pentagon',
          width: '100%',
          height: '100%',
          drawOutOfBound: false,
          textStyle: {
            fontFamily: 'Inter, system-ui, sans-serif',
            fontWeight: 'bold',
            color: () => {
              // Generate colors based on accent color (orange) with variations
              const colors = [
                'hsl(15, 83%, 54%)', // accent color
                'hsl(15, 83%, 45%)',
                'hsl(15, 83%, 63%)',
                'hsl(20, 75%, 50%)',
                'hsl(10, 90%, 58%)',
                'hsl(15, 70%, 48%)',
              ];
              return colors[Math.floor(Math.random() * colors.length)];
            }
          },
          emphasis: {
            textStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          data: data.terms.map(term => ({
            name: term.name,
            value: term.value
          }))
        }
      ],
      animation: prefersReducedMotion.current ? false : true,
      animationDuration: prefersReducedMotion.current ? 0 : 1000,
      animationEasing: 'cubicOut'
    };
  };

  if (loading) {
    return (
      <div className={`h-64 md:h-80 w-full flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent mb-4"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading word cloud data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`h-64 md:h-80 w-full flex items-center justify-center ${className}`}>
        <div className="text-center px-4">
          <p className="text-sm text-red dark:text-red/80 mb-2">Failed to load data</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!data || !data.terms || data.terms.length === 0) {
    return (
      <div className={`h-64 md:h-80 w-full flex items-center justify-center ${className}`}>
        <p className="text-sm text-gray-600 dark:text-gray-400">No data available</p>
      </div>
    );
  }

  return (
    <div className={`h-64 md:h-80 w-full ${className}`}>
      <ReactECharts
        ref={chartRef}
        option={getOption()}
        style={{ height: '100%', width: '100%' }}
        opts={{ renderer: 'svg' }}
      />
    </div>
  );
}

