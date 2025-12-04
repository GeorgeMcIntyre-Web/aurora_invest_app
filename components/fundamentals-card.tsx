'use client';

import { PieChart, BarChart3, Info } from 'lucide-react';
import { StockData } from '@/lib/domain/AnalysisTypes';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import dynamic from 'next/dynamic';

const FundamentalsChart = dynamic(() => import('./fundamentals-chart'), {
  ssr: false,
  loading: () => <div className="h-48 flex items-center justify-center text-ai-muted">Loading chart...</div>,
});

interface FundamentalsCardProps {
  stock: StockData;
  fundamentalsView: string;
  valuationView: string;
}

export function FundamentalsCard({ stock, fundamentalsView, valuationView }: FundamentalsCardProps) {
  const f = stock?.fundamentals;

  if (!f) {
    return (
      <div className="bg-ai-card border border-gray-700 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <PieChart className="h-5 w-5 text-ai-primary" />
          <h3 className="text-lg font-semibold text-ai-text">Fundamentals & Valuation</h3>
        </div>
        <p className="text-ai-muted">No fundamentals data available</p>
      </div>
    );
  }

  const metrics = [
    { 
      label: 'Trailing P/E', 
      value: f?.trailingPE?.toFixed?.(1) ?? 'N/A', 
      benchmark: '< 25',
      description: 'Price-to-Earnings ratio based on past 12 months of earnings. Lower values may indicate undervaluation.'
    },
    { 
      label: 'Forward P/E', 
      value: f?.forwardPE?.toFixed?.(1) ?? 'N/A', 
      benchmark: '< 20',
      description: 'Price-to-Earnings ratio based on projected future earnings. Reflects market expectations for growth.'
    },
    { 
      label: 'EPS Growth (YoY)', 
      value: f?.epsGrowthYoYPct ? `${f.epsGrowthYoYPct.toFixed(1)}%` : 'N/A', 
      benchmark: '> 10%',
      description: 'Year-over-year earnings per share growth rate. Higher growth typically commands higher valuations.'
    },
    { 
      label: 'Net Margin', 
      value: f?.netMarginPct ? `${f.netMarginPct.toFixed(1)}%` : 'N/A', 
      benchmark: '> 15%',
      description: 'Percentage of revenue that becomes profit after all expenses. Indicates operational efficiency.'
    },
    { 
      label: 'FCF Yield', 
      value: f?.freeCashFlowYieldPct ? `${f.freeCashFlowYieldPct.toFixed(1)}%` : 'N/A', 
      benchmark: '> 3%',
      description: 'Free cash flow divided by market cap. Shows how much cash the company generates relative to its value.'
    },
    { 
      label: 'ROE', 
      value: f?.roe ? `${f.roe.toFixed(1)}%` : 'N/A', 
      benchmark: '> 15%',
      description: 'Return on Equity measures profitability relative to shareholder equity. Indicates how efficiently capital is used.'
    },
  ];

  return (
    <TooltipProvider>
      <div className="bg-ai-card border border-gray-700 rounded-lg p-6 hover:shadow-xl transition-shadow">
        <div className="flex items-center gap-3 mb-6">
          <PieChart className="h-5 w-5 text-ai-primary" />
          <h3 className="text-lg font-semibold text-ai-text">Fundamentals & Valuation</h3>
        </div>

        <div className="space-y-6">
          {/* Text Views */}
          <div className="space-y-2">
            <div className="text-sm text-ai-muted">Fundamentals</div>
            <div className="text-sm text-ai-text bg-ai-bg p-3 rounded-lg">{fundamentalsView}</div>
          </div>

          <div className="space-y-2">
            <div className="text-sm text-ai-muted">Valuation</div>
            <div className="text-sm text-ai-text bg-ai-bg p-3 rounded-lg">{valuationView}</div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-4">
            {metrics?.map((metric) => (
              <div key={metric?.label} className="bg-ai-bg p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-ai-muted">{metric?.label}</div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3.5 w-3.5 text-ai-muted hover:text-ai-primary cursor-help transition-colors" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-[220px] text-xs">{metric?.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="text-lg font-semibold text-ai-text mt-1">{metric?.value}</div>
                <div className="text-xs text-ai-muted mt-1">Target: {metric?.benchmark}</div>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="h-4 w-4 text-ai-accent" />
              <div className="text-sm font-medium text-ai-text">Key Metrics Visualization</div>
            </div>
            <FundamentalsChart stock={stock} />
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
