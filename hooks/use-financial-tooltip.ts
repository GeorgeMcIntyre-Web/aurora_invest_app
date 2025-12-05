'use client';

import { useState, useCallback, useMemo } from 'react';
import type { MetricType, TrendDirection, Sentiment } from '@/components/ui/financial-tooltip';

export interface FinancialMetricData {
  label: string;
  value: number | string;
  type?: MetricType;
  description?: string;
  benchmark?: string | number;
  trend?: TrendDirection;
  sentiment?: Sentiment;
  change?: number;
  changeLabel?: string;
}

export interface UseFinancialTooltipOptions {
  defaultOpen?: boolean;
  delayDuration?: number;
}

/**
 * Hook for managing financial tooltip state and data formatting
 * 
 * @example
 * ```tsx
 * const { metric, updateMetric, isOpen, setIsOpen } = useFinancialTooltip({
 *   label: 'P/E Ratio',
 *   value: 23.5,
 *   type: 'ratio',
 *   description: 'Price-to-earnings ratio',
 * });
 * ```
 */
export function useFinancialTooltip(
  initialMetric?: FinancialMetricData,
  options?: UseFinancialTooltipOptions
) {
  const [metric, setMetric] = useState<FinancialMetricData | undefined>(initialMetric);
  const [isOpen, setIsOpen] = useState(options?.defaultOpen ?? false);

  const updateMetric = useCallback((newMetric: Partial<FinancialMetricData>) => {
    setMetric((prev) => (prev ? { ...prev, ...newMetric } : undefined));
  }, []);

  const resetMetric = useCallback(() => {
    setMetric(initialMetric);
  }, [initialMetric]);

  return {
    metric,
    setMetric,
    updateMetric,
    resetMetric,
    isOpen,
    setIsOpen,
  };
}

/**
 * Hook for calculating metric sentiment based on value and benchmark
 */
export function useMetricSentiment(
  value: number | undefined,
  benchmark: number | undefined,
  invertComparison = false
): Sentiment {
  return useMemo(() => {
    if (value === undefined || benchmark === undefined) return 'neutral';

    const isAboveBenchmark = value > benchmark;
    const isGood = invertComparison ? !isAboveBenchmark : isAboveBenchmark;

    const percentageDiff = Math.abs(((value - benchmark) / benchmark) * 100);

    if (isGood) {
      return percentageDiff > 20 ? 'positive' : 'neutral';
    } else {
      return percentageDiff > 20 ? 'negative' : 'warning';
    }
  }, [value, benchmark, invertComparison]);
}

/**
 * Hook for calculating trend direction based on current and previous value
 */
export function useMetricTrend(
  currentValue: number | undefined,
  previousValue: number | undefined
): { trend: TrendDirection; change: number | undefined } {
  return useMemo(() => {
    if (currentValue === undefined || previousValue === undefined) {
      return { trend: 'neutral', change: undefined };
    }

    const change = ((currentValue - previousValue) / previousValue) * 100;

    if (Math.abs(change) < 0.01) {
      return { trend: 'neutral', change: 0 };
    }

    return {
      trend: change > 0 ? 'up' : 'down',
      change,
    };
  }, [currentValue, previousValue]);
}

/**
 * Hook for formatting financial values based on type
 */
export function useFormattedValue(value: number | string | undefined, type?: MetricType): string {
  return useMemo(() => {
    if (value === undefined) return 'N/A';
    if (typeof value === 'string') return value;

    switch (type) {
      case 'percentage':
        return `${value.toFixed(2)}%`;
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(value);
      case 'ratio':
        return `${value.toFixed(2)}x`;
      case 'score':
        return value.toFixed(1);
      case 'number':
      default:
        return new Intl.NumberFormat('en-US', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        }).format(value);
    }
  }, [value, type]);
}

/**
 * Hook for creating a complete financial metric with all computed properties
 */
export function useFinancialMetric(
  label: string,
  value: number | string | undefined,
  options?: {
    type?: MetricType;
    description?: string;
    benchmark?: number | string;
    previousValue?: number;
    invertSentiment?: boolean;
    changeLabel?: string;
  }
): FinancialMetricData {
  const formattedValue = useFormattedValue(
    typeof value === 'string' ? value : value,
    options?.type
  );

  const numericValue = typeof value === 'number' ? value : undefined;
  const numericBenchmark =
    typeof options?.benchmark === 'number' ? options.benchmark : undefined;

  const sentiment = useMetricSentiment(
    numericValue,
    numericBenchmark,
    options?.invertSentiment
  );

  const { trend, change } = useMetricTrend(numericValue, options?.previousValue);

  return useMemo(
    () => ({
      label,
      value: value ?? 'N/A',
      type: options?.type,
      description: options?.description,
      benchmark: options?.benchmark,
      sentiment,
      trend,
      change,
      changeLabel: options?.changeLabel,
    }),
    [label, value, options, sentiment, trend, change]
  );
}

/**
 * Hook for managing multiple financial tooltips
 */
export function useFinancialTooltips(initialMetrics?: FinancialMetricData[]) {
  const [metrics, setMetrics] = useState<FinancialMetricData[]>(initialMetrics ?? []);
  const [activeMetricId, setActiveMetricId] = useState<string | null>(null);

  const addMetric = useCallback((metric: FinancialMetricData) => {
    setMetrics((prev) => [...prev, metric]);
  }, []);

  const updateMetricByLabel = useCallback(
    (label: string, updates: Partial<FinancialMetricData>) => {
      setMetrics((prev) =>
        prev.map((m) => (m.label === label ? { ...m, ...updates } : m))
      );
    },
    []
  );

  const removeMetric = useCallback((label: string) => {
    setMetrics((prev) => prev.filter((m) => m.label !== label));
  }, []);

  const clearMetrics = useCallback(() => {
    setMetrics([]);
  }, []);

  return {
    metrics,
    setMetrics,
    addMetric,
    updateMetricByLabel,
    removeMetric,
    clearMetrics,
    activeMetricId,
    setActiveMetricId,
  };
}
