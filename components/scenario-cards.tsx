'use client';

import { TrendingUp, TrendingDown, Minus, Activity, Info } from 'lucide-react';
import { ScenarioSummary, ScenarioBand } from '@/lib/domain/AnalysisTypes';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import dynamic from 'next/dynamic';

const ScenarioChart = dynamic(() => import('./scenario-chart'), {
  ssr: false,
  loading: () => <div className="h-64 flex items-center justify-center text-ai-muted">Loading chart...</div>,
});

interface ScenarioCardsProps {
  scenarios: ScenarioSummary;
}

function ScenarioCard({
  title,
  scenario,
  icon: Icon,
  colorClass,
  tooltipDescription,
}: {
  title: string;
  scenario: ScenarioBand;
  icon: React.ElementType;
  colorClass: string;
  tooltipDescription: string;
}) {
  const [min, max] = scenario?.expectedReturnPctRange ?? [0, 0];
  const mid = ((min + max) / 2)?.toFixed(1) ?? '0.0';

  return (
    <div className="bg-ai-card border border-gray-700 rounded-lg p-6 hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${colorClass}`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-ai-text">{title}</h3>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="h-4 w-4 text-ai-muted hover:text-ai-primary cursor-help transition-colors" />
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-[220px] text-xs">{tooltipDescription}</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="space-y-3">
        <div>
          <div className="text-3xl font-bold text-ai-text">{mid}%</div>
          <div className="text-sm text-ai-muted">Expected Return (Midpoint)</div>
        </div>

        <div>
          <div className="text-sm text-ai-muted">Range</div>
          <div className="text-lg font-medium text-ai-text">
            {min}% to {max}%
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="text-sm text-ai-muted">Probability</div>
            <span className="text-sm font-medium text-ai-text">{scenario?.probabilityPct ?? 0}%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-ai-bg rounded-full h-2 overflow-hidden">
              <div
                className={`h-full ${colorClass}`}
                style={{ width: `${scenario?.probabilityPct ?? 0}%` }}
              />
            </div>
          </div>
        </div>

        <p className="text-sm text-ai-muted mt-4">{scenario?.description ?? ''}</p>
      </div>
    </div>
  );
}

export function ScenarioCards({ scenarios }: ScenarioCardsProps) {
  if (!scenarios) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Scenario Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ScenarioCard
            title="Bull Case"
            scenario={scenarios?.bull}
            icon={TrendingUp}
            colorClass="bg-ai-accent"
            tooltipDescription="Optimistic scenario assuming favorable market conditions, strong earnings, and positive sentiment. Represents upside potential."
          />
          <ScenarioCard
            title="Base Case"
            scenario={scenarios?.base}
            icon={Minus}
            colorClass="bg-ai-primary"
            tooltipDescription="Most likely scenario based on current trends and fundamentals. Represents the expected outcome under normal conditions."
          />
          <ScenarioCard
            title="Bear Case"
            scenario={scenarios?.bear}
            icon={TrendingDown}
            colorClass="bg-red-600"
            tooltipDescription="Pessimistic scenario assuming adverse market conditions, earnings misses, or negative catalysts. Represents downside risk."
          />
        </div>

        {/* Point Estimate */}
        <div className="bg-ai-card border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-ai-primary" />
              <h3 className="text-lg font-semibold text-ai-text">Probability-Weighted Estimate</h3>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-ai-muted hover:text-ai-primary cursor-help transition-colors" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-[220px] text-xs">Expected return calculated by weighting each scenario by its probability. Provides a single expected outcome.</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-ai-text">
              {scenarios?.pointEstimateReturnPct?.toFixed?.(1) ?? '0.0'}%
            </span>
            <span className="text-sm text-ai-muted">over {scenarios?.horizonMonths ?? 3} months</span>
          </div>
          <p className="text-sm text-yellow-500 mt-4">
            {scenarios?.uncertaintyComment ?? ''}
          </p>
        </div>

        {/* Scenario Comparison Chart */}
        <div className="bg-ai-card border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-ai-text mb-4">Scenario Comparison</h3>
          <ScenarioChart scenarios={scenarios} />
        </div>
      </div>
    </TooltipProvider>
  );
}
