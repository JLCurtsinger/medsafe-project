import { useEffect, useRef, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

interface SignalsExposureData {
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

interface SignalsVsExposureChartProps {
  className?: string;
}

export function SignalsVsExposureChart({ className = '' }: SignalsVsExposureChartProps) {
  const [data, setData] = useState<SignalsExposureData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDrug, setSelectedDrug] = useState<string>('');
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

    async function fetchData(drug?: string) {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (drug) {
          params.set('drug', drug);
        }
        const queryString = params.toString();
        const fnUrl = `/.netlify/functions/data-signals-exposure${queryString ? `?${queryString}` : ''}`;

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
            `Signals vs exposure API returned non-JSON. Are you running Netlify dev? Try \`npx netlify dev\`. ` +
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

        setData(result);

        // Set default selected drug on initial load
        if (result.topList && result.topList.length > 0 && !selectedDrug) {
          setSelectedDrug(result.topList[0].drugName);
        }
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load signals vs exposure data');
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    // Initial fetch - get top list
    fetchData();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedDrug || !data?.topList) return;

    let cancelled = false;

    async function fetchDrugData() {
      try {
        setLoading(true);
        setError(null);

        const fnUrl = `/.netlify/functions/data-signals-exposure?drug=${encodeURIComponent(selectedDrug)}`;

        const response = await fetch(fnUrl);

        if (!response.ok) {
          let errorDetails = '';
          try {
            const errorData = await response.json();
            if (errorData.details) {
              errorDetails = `: ${errorData.details}`;
            }
          } catch {
            errorDetails = `: ${response.statusText}`;
          }
          throw new Error(`Failed to fetch data (${response.status})${errorDetails}`);
        }

        const result = await response.json();

        if (cancelled) return;

        if (result.error) {
          const errorMsg = result.details
            ? `${result.error}: ${result.details}`
            : (result.message || result.error);
          throw new Error(errorMsg);
        }

        // Merge with existing topList
        setData(prev => prev ? { ...result, topList: prev.topList } : result);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load drug data');
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchDrugData();

    return () => {
      cancelled = true;
    };
  }, [selectedDrug, data?.topList]);

  const getOption = () => {
    if (!data || !data.items || data.items.length === 0) {
      return {};
    }

    const item = data.items[0];
    const exposureTypeLabel = data.exposureType === 'beneficiaries' ? 'per 100k beneficiaries' : 'per 100k claims';
    const rateLabel = `Rate ${exposureTypeLabel}`;

    return {
      backgroundColor: 'transparent',
      tooltip: {
        show: true,
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        formatter: (params: any) => {
          const param = Array.isArray(params) ? params[0] : params;
          return `
            <div style="padding: 8px;">
              <div style="font-weight: bold; margin-bottom: 4px;">${item.drugName}</div>
              <div>FAERS Reports (${data.timeWindowDays} days): <strong>${item.faersReports.toLocaleString()}</strong></div>
              <div>Exposure Count: <strong>${item.exposureCount.toLocaleString()}</strong></div>
              <div>Rate ${exposureTypeLabel}: <strong>${item.ratePer100k.toFixed(1)}</strong></div>
            </div>
          `;
        },
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        textStyle: {
          color: '#fff',
        },
      },
      grid: {
        left: '15%',
        right: '10%',
        top: '10%',
        bottom: '10%',
        containLabel: false,
      },
      xAxis: {
        type: 'value',
        name: rateLabel,
        nameLocation: 'middle',
        nameGap: 30,
        nameTextStyle: {
          color: '#666',
          fontSize: 12,
        },
        axisLabel: {
          color: '#666',
        },
        axisLine: {
          lineStyle: {
            color: '#ddd',
          },
        },
        splitLine: {
          lineStyle: {
            color: '#eee',
            type: 'dashed',
          },
        },
      },
      yAxis: {
        type: 'category',
        data: [item.drugName],
        axisLabel: {
          color: '#666',
        },
        axisLine: {
          lineStyle: {
            color: '#ddd',
          },
        },
      },
      series: [
        {
          type: 'bar',
          data: [item.ratePer100k],
          itemStyle: {
            color: 'hsl(15, 83%, 54%)', // accent color
          },
          label: {
            show: true,
            position: 'right',
            formatter: (params: any) => {
              return `${params.value.toFixed(1)}`;
            },
            color: '#666',
          },
        },
      ],
      animation: prefersReducedMotion.current ? false : true,
      animationDuration: prefersReducedMotion.current ? 0 : 800,
      animationEasing: 'cubicOut',
    };
  };

  if (loading && !data) {
    return (
      <div className={`h-64 md:h-80 w-full flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent mb-4"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading signals vs exposure data...</p>
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

  if (!data || !data.topList || data.topList.length === 0) {
    return (
      <div className={`h-64 md:h-80 w-full flex items-center justify-center ${className}`}>
        <p className="text-sm text-gray-600 dark:text-gray-400">No data available</p>
      </div>
    );
  }

  const currentItem = data.items && data.items.length > 0 ? data.items[0] : null;
  const exposureTypeLabel = data.exposureType === 'beneficiaries' ? 'per 100k beneficiaries' : 'per 100k claims';

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drug Selection Dropdown */}
      <div className="flex items-center gap-3">
        <label htmlFor="drug-select" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Drug:
        </label>
        <Select value={selectedDrug || data.topList[0]?.drugName} onValueChange={setSelectedDrug}>
          <SelectTrigger id="drug-select" className="w-[250px]">
            <SelectValue placeholder="Select a drug" />
          </SelectTrigger>
          <SelectContent>
            {data.topList.map((drug) => (
              <SelectItem key={drug.drugName} value={drug.drugName}>
                {drug.drugName} ({drug.exposureCount.toLocaleString()} {data.exposureType})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Chart */}
      {loading && currentItem ? (
        <div className="h-64 md:h-80 w-full flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent mb-4"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Loading chart data...</p>
          </div>
        </div>
      ) : currentItem ? (
        <div className="h-64 md:h-80 w-full">
          <ReactECharts
            ref={chartRef}
            option={getOption()}
            style={{ height: '100%', width: '100%' }}
            opts={{ renderer: 'svg' }}
          />
        </div>
      ) : (
        <div className="h-64 md:h-80 w-full flex items-center justify-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">Select a drug to view data</p>
        </div>
      )}
    </div>
  );
}

