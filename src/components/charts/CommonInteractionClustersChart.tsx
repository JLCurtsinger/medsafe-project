import { useEffect, useRef, useState } from 'react';
import ReactECharts from 'echarts-for-react';

interface Cluster {
  id: string;
  label: string;
  count: number;
  terms: string[];
}

interface InteractionClustersData {
  generatedAt: string;
  source: string;
  labelCount: number;
  clusters: Cluster[];
}

interface CommonInteractionClustersChartProps {
  className?: string;
}

export function CommonInteractionClustersChart({ className = '' }: CommonInteractionClustersChartProps) {
  const [data, setData] = useState<InteractionClustersData | null>(null);
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

        const fnUrl = `/.netlify/functions/data-interaction-clusters`;

        const response = await fetch(fnUrl);
        
        if (!response.ok) {
          let errorDetails = '';
          try {
            const errorData = await response.json();
            if (errorData.details) {
              errorDetails = `: ${errorData.details}`;
            } else if (errorData.message) {
              errorDetails = `: ${errorData.message}`;
            }
          } catch {
            errorDetails = `: ${response.statusText}`;
          }
          throw new Error(`Failed to fetch data (${response.status})${errorDetails}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          const snippet = text.substring(0, 100);
          throw new Error(
            `API returned non-JSON. Are you running Netlify dev? Try \`npx netlify dev\`. ` +
            `Response preview: ${snippet}...`
          );
        }

        const result = await response.json();
        
        if (cancelled) return;

        if (result.error) {
          const errorMsg = result.details 
            ? `${result.error}: ${result.details}` 
            : (result.message || result.error);
          throw new Error(errorMsg);
        }

        // Debug logging (dev only, when URL has ?debugClusters=1)
        if (import.meta.env.DEV) {
          const urlParams = new URLSearchParams(window.location.search);
          if (urlParams.get('debugClusters') === '1') {
            console.log('[CommonInteractionClustersChart] Parsed JSON:', result);
          }
        }

        setData(result);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load interaction clusters data');
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
    if (!data || !data.clusters || data.clusters.length === 0) {
      return {};
    }

    return {
      backgroundColor: 'transparent',
      tooltip: {
        show: true,
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: (params: any) => {
          const param = Array.isArray(params) ? params[0] : params;
          const cluster = data.clusters.find(c => c.label === param.name);
          if (cluster && cluster.terms.length > 0) {
            return `${param.name}<br/>Count: ${param.value}<br/>Top terms: ${cluster.terms.join(', ')}`;
          }
          return `${param.name}<br/>Count: ${param.value}`;
        },
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        textStyle: {
          color: '#fff'
        }
      },
      grid: {
        left: '10%',
        right: '5%',
        bottom: '15%',
        top: '5%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        name: 'Label Count',
        nameLocation: 'middle',
        nameGap: 30,
        axisLabel: {
          color: 'rgba(0, 0, 0, 0.7)'
        },
        axisLine: {
          lineStyle: {
            color: 'rgba(0, 0, 0, 0.2)'
          }
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(0, 0, 0, 0.1)'
          }
        }
      },
      yAxis: {
        type: 'category',
        data: data.clusters.map(c => c.label),
        axisLabel: {
          color: 'rgba(0, 0, 0, 0.7)',
          interval: 0
        },
        axisLine: {
          lineStyle: {
            color: 'rgba(0, 0, 0, 0.2)'
          }
        }
      },
      series: [
        {
          type: 'bar',
          data: data.clusters.map(c => Math.max(0, c.count)), // Ensure non-negative values
          itemStyle: {
            color: 'hsl(15, 83%, 54%)' // accent color
          },
          label: {
            show: true,
            position: 'right',
            color: 'rgba(0, 0, 0, 0.7)',
            formatter: '{c}'
          }
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
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading interaction clusters data...</p>
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

  if (!data || !data.clusters || data.clusters.length === 0) {
    return (
      <div className={`h-64 md:h-80 w-full flex items-center justify-center ${className}`}>
        <p className="text-sm text-gray-600 dark:text-gray-400">No data available</p>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {data.labelCount > 0 && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          Based on {data.labelCount.toLocaleString()} labels
        </p>
      )}
      <div className="h-64 md:h-80 w-full">
        <ReactECharts
          ref={chartRef}
          option={getOption()}
          style={{ height: '100%', width: '100%' }}
          opts={{ renderer: 'svg' }}
        />
      </div>
    </div>
  );
}

