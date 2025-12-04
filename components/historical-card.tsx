'use client';

import { useMemo } from 'react';
import { Activity, TrendingDown, TrendingUp, Info } from 'lucide-react';
import { HistoricalData } from '@/lib/domain/AnalysisTypes';
import { calculateReturns, calculateVolatility, detectTrend } from '@/lib/domain/auroraEngine';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type HistoricalPeriod = HistoricalData['period'];

const PERIOD_LABEL: Record<HistoricalPeriod, string> = {
  '1M': '1 Month',
  '3M': '3 Months',
  '6M': '6 Months',
  '1Y': '1 Year',
  '5Y': '5 Years',
};

interface HistoricalCardProps {
  data: HistoricalData | null;
  selectedPeriod: HistoricalPeriod;
  isLoading?: boolean;
}

const formatPercent = (value: number) => {
  const rounded = Number.isFinite(value) ? value.toFixed(2) : '0.00';
  const numeric = Number(rounded);
  const prefix = numeric > 0 ? '+' : '';
  return `${prefix}${rounded}%`;
};

export function HistoricalCard({ data, selectedPeriod, isLoading = false }: HistoricalCardProps) {
  const summary = useMemo(() => {
    if (!data?.dataPoints?.length) {
      return {
        periodReturn: 0,
        annualizedReturn: 0,
        volatility: 0,
        trend: 'sideways' as const,
      };
    }

    const returns = calculateReturns(data);
    return {
      periodReturn: returns.period,
      annualizedReturn: returns.annualized,
      volatility: calculateVolatility(data),
      trend: detectTrend(data),
    };
  }, [data]);

  const volatilityLabel =
    summary.volatility >= 40
      ? 'High volatility'
      : summary.volatility >= 20
      ? 'Moderate volatility'
      : 'Low volatility';

  const observations: string[] = [];
  if (data?.dataPoints?.length) {
    const direction = summary.periodReturn >= 0 ? 'increased' : 'decreased';
    observations.push(
      `Price ${direction} ${formatPercent(Math.abs(summary.periodReturn))} over the last ${
        PERIOD_LABEL[selectedPeriod] ?? 'period'
      }.`
    );
  }
  observations.push(`${volatilityLabel} (~${summary.volatility.toFixed(1)}% annualized).`);
  if (summary.trend === 'uptrend') {
    observations.push('Buyers have been in control with higher highs and higher lows.');
  } else if (summary.trend === 'downtrend') {
    observations.push('Selling pressure dominates; rallies have faded quickly.');
  } else {
    observations.push('Price action is range-bound with no clear direction.');
  }

  const trendMeta = {
    uptrend: {
      label: 'Uptrend',
      icon: TrendingUp,
      className: 'text-green-400 bg-green-500/10 border-green-500/30',
    },
    downtrend: {
      label: 'Downtrend',
      icon: TrendingDown,
      className: 'text-red-400 bg-red-500/10 border-red-500/30',
    },
    sideways: {
      label: 'Sideways',
      icon: Activity,
      className: 'text-yellow-300 bg-yellow-500/10 border-yellow-500/30',
    },
  }[summary.trend];

  return (
    <TooltipProvider>
      <div className="bg-ai-card border border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-ai-muted uppercase tracking-wider font-semibold">Historical Insights</p>
            <p className="text-lg text-ai-text font-semibold">{PERIOD_LABEL[selectedPeriod]}</p>
          </div>
          {trendMeta && (
            <div className={`flex items-center gap-2 rounded-full border px-3 py-1 text-sm ${trendMeta.className}`}>
              <trendMeta.icon className="h-4 w-4" />
              <span>{trendMeta.label}</span>
            </div>
          )}
        </div>

        {isLoading && (
          <div className="mt-6 rounded-lg border border-dashed border-gray-700 bg-ai-bg p-6 text-center text-sm text-ai-muted">
            Calculating historical metrics...
          </div>
        )}

        {!isLoading && (
          <>
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-gray-700 bg-ai-bg p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase text-ai-muted tracking-wide">Period Return</p>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3.5 w-3.5 text-ai-muted hover:text-ai-primary cursor-help transition-colors" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-[220px] text-xs">Total percentage change in price over the selected time period. Does not account for compounding.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <p className="mt-2 text-2xl font-semibold text-ai-text">{formatPercent(summary.periodReturn)}</p>
                <p className="text-xs text-ai-muted mt-1">Change over {PERIOD_LABEL[selectedPeriod]}</p>
              </div>
              <div className="rounded-lg border border-gray-700 bg-ai-bg p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase text-ai-muted tracking-wide">Annualized Return</p>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3.5 w-3.5 text-ai-muted hover:text-ai-primary cursor-help transition-colors" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-[220px] text-xs">Return normalized to a 12-month period with compounding. Useful for comparing different time periods.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <p className="mt-2 text-2xl font-semibold text-ai-text">{formatPercent(summary.annualizedReturn)}</p>
                <p className="text-xs text-ai-muted mt-1">Assumes compounding</p>
              </div>
              <div className="rounded-lg border border-gray-700 bg-ai-bg p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase text-ai-muted tracking-wide">Volatility</p>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3.5 w-3.5 text-ai-muted hover:text-ai-primary cursor-help transition-colors" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-[220px] text-xs">Annualized standard deviation of returns. Higher volatility means larger price swings and increased risk.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <p className="mt-2 text-2xl font-semibold text-ai-text">{summary.volatility.toFixed(1)}%</p>
                <p className="text-xs text-ai-muted mt-1">{volatilityLabel}</p>
              </div>
            </div>

            <div className="mt-6 rounded-lg border border-gray-700 bg-ai-bg p-5">
              <p className="text-sm font-semibold text-ai-text mb-3">Key Observations</p>
              <ul className="space-y-2">
                {observations.map((item, index) => (
                  <li key={index} className="flex gap-2 text-sm text-ai-text">
                    <span className="text-ai-accent">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </TooltipProvider>
  );
}

