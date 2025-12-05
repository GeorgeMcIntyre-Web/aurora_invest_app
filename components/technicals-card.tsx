'use client';

import { Activity, TrendingUp } from 'lucide-react';
import { StockData } from '@/lib/domain/AnalysisTypes';
import dynamic from 'next/dynamic';
import { FinancialTooltip } from './financial-tooltip';
import { TooltipProvider } from '@/components/ui/tooltip';

const TechnicalsChart = dynamic(() => import('./technicals-chart'), {
  ssr: false,
  loading: () => <div className="h-48 flex items-center justify-center text-ai-muted">Loading chart...</div>,
});

interface TechnicalsCardProps {
  stock: StockData;
  technicalView: string;
}

export function TechnicalsCard({ stock, technicalView }: TechnicalsCardProps) {
  const t = stock?.technicals;

  if (!t) {
    return (
      <div className="bg-ai-card border border-gray-700 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Activity className="h-5 w-5 text-ai-accent" />
          <h3 className="text-lg font-semibold text-ai-text">Technical Analysis</h3>
        </div>
        <p className="text-ai-muted">No technical data available</p>
      </div>
    );
  }

  const price = t?.price ?? 0;
  const sma20 = t?.sma20;
  const sma50 = t?.sma50;
  const sma200 = t?.sma200;
  const rsi = t?.rsi14;
  const high52w = t?.price52wHigh;
  const low52w = t?.price52wLow;

  const indicators = [
    { label: 'Current Price', value: `$${price?.toFixed?.(2) ?? '0.00'}`, tooltip: null },
    { label: 'SMA 20', value: sma20 ? `$${sma20.toFixed(2)}` : 'N/A', tooltip: 'sma20' as const },
    { label: 'SMA 50', value: sma50 ? `$${sma50.toFixed(2)}` : 'N/A', tooltip: 'sma50' as const },
    { label: 'SMA 200', value: sma200 ? `$${sma200.toFixed(2)}` : 'N/A', tooltip: 'sma200' as const },
    { label: 'RSI (14)', value: rsi ? rsi.toFixed(1) : 'N/A', tooltip: 'rsi' as const },
    { label: '52W High', value: high52w ? `$${high52w.toFixed(2)}` : 'N/A', tooltip: '52wHigh' as const },
    { label: '52W Low', value: low52w ? `$${low52w.toFixed(2)}` : 'N/A', tooltip: '52wLow' as const },
  ];

  // Calculate price position in 52w range
  let pricePositionPct = 50;
  if (high52w && low52w) {
    const range = high52w - low52w;
    const fromLow = price - low52w;
    pricePositionPct = (fromLow / range) * 100;
  }

  return (
    <TooltipProvider>
      <div className="bg-ai-card border border-gray-700 rounded-lg p-6 hover:shadow-xl transition-shadow">
        <div className="flex items-center gap-3 mb-6">
          <Activity className="h-5 w-5 text-ai-accent" />
          <h3 className="text-lg font-semibold text-ai-text">Technical Analysis</h3>
        </div>

        <div className="space-y-6">
          {/* Technical View */}
          <div className="space-y-2">
            <div className="text-sm text-ai-muted">Analysis</div>
            <div className="text-sm text-ai-text bg-ai-bg p-3 rounded-lg">{technicalView}</div>
          </div>

          {/* 52-Week Range */}
          <div>
            <div className="text-sm text-ai-muted mb-2">52-Week Price Position</div>
            <div className="relative h-8 bg-ai-bg rounded-lg overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-600 via-yellow-500 to-ai-accent"
                style={{ width: `${pricePositionPct}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-medium text-white z-10 drop-shadow-lg">
                  {pricePositionPct?.toFixed?.(0) ?? '0'}%
                </span>
              </div>
            </div>
            <div className="flex justify-between text-xs text-ai-muted mt-1">
              <span>Low: ${low52w?.toFixed?.(2) ?? '0.00'}</span>
              <span>High: ${high52w?.toFixed?.(2) ?? '0.00'}</span>
            </div>
          </div>

          {/* Indicators Grid */}
          <div className="grid grid-cols-2 gap-4">
            {indicators?.map((indicator) => (
              <div key={indicator?.label} className="bg-ai-bg p-3 rounded-lg">
                {indicator.tooltip ? (
                  <FinancialTooltip term={indicator.tooltip}>
                    <div className="text-xs text-ai-muted">{indicator?.label}</div>
                  </FinancialTooltip>
                ) : (
                  <div className="text-xs text-ai-muted">{indicator?.label}</div>
                )}
                <div className="text-lg font-semibold text-ai-text mt-1">{indicator?.value}</div>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-ai-accent" />
              <div className="text-sm font-medium text-ai-text">Price vs Moving Averages</div>
            </div>
            <TechnicalsChart stock={stock} />
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
