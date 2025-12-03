'use client';

import { ShieldAlert, Activity, Droplet, AlertOctagon } from 'lucide-react';
import { AnalysisResult, StockData } from '@/lib/domain/AnalysisTypes';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

type Severity = 'low' | 'medium' | 'high' | 'unknown';

interface RiskCardProps {
  result: AnalysisResult;
  stock: StockData;
}

interface RiskFactor {
  label: string;
  value: string;
  severity: Severity;
  score: number;
  tooltip: string;
}

const severityStyles: Record<
  Severity,
  { text: string; bg: string; bar: string; label: string }
> = {
  low: {
    text: 'text-emerald-400',
    bg: 'bg-emerald-500/15 border border-emerald-500/30',
    bar: 'from-emerald-400 to-emerald-500',
    label: 'Lower Risk',
  },
  medium: {
    text: 'text-yellow-400',
    bg: 'bg-yellow-500/15 border border-yellow-500/30',
    bar: 'from-yellow-400 to-orange-500',
    label: 'Moderate Risk',
  },
  high: {
    text: 'text-red-400',
    bg: 'bg-red-500/15 border border-red-500/30',
    bar: 'from-red-500 to-rose-500',
    label: 'Elevated Risk',
  },
  unknown: {
    text: 'text-ai-muted',
    bg: 'bg-ai-bg border border-gray-700',
    bar: 'from-ai-muted to-ai-muted',
    label: 'No Signal',
  },
};

const clamp = (value: number) => Math.min(1, Math.max(0, value));

const categorizeDebt = (ratio?: number): Severity => {
  if (typeof ratio !== 'number') return 'unknown';
  if (ratio <= 0.8) return 'low';
  if (ratio <= 1.5) return 'medium';
  return 'high';
};

const categorizeVolatility = (rangePct?: number): Severity => {
  if (typeof rangePct !== 'number') return 'unknown';
  if (rangePct <= 35) return 'low';
  if (rangePct <= 65) return 'medium';
  return 'high';
};

const categorizeLiquidity = (ratio?: number): Severity => {
  if (typeof ratio !== 'number') return 'unknown';
  if (ratio >= 1.2) return 'low';
  if (ratio >= 0.7) return 'medium';
  return 'high';
};

const categorizeSentiment = (consensus?: AnalysisResult['sentimentView']): Severity => {
  if (!consensus) return 'unknown';
  const normalized = consensus.toLowerCase();
  if (normalized.includes('strong sell') || normalized.includes('sell')) {
    return 'high';
  }
  if (normalized.includes('hold')) {
    return 'medium';
  }
  return 'low';
};

export function RiskCard({ result, stock }: RiskCardProps) {
  const riskScore = result?.summary?.riskScore ?? 0;
  const conviction = result?.summary?.convictionScore3m ?? 0;
  const riskNotes = result?.planningGuidance?.riskNotes ?? [];

  const fundamentals = stock?.fundamentals;
  const technicals = stock?.technicals;
  const sentiment = stock?.sentiment;

  const priceRangePct =
    technicals?.price52wHigh && technicals?.price52wLow && technicals.price52wLow > 0
      ? ((technicals.price52wHigh - technicals.price52wLow) / technicals.price52wLow) * 100
      : undefined;

  const volumeRatio =
    technicals?.volume && technicals?.avgVolume && technicals.avgVolume > 0
      ? technicals.volume / technicals.avgVolume
      : undefined;

  const sentimentDescriptor = sentiment?.analystConsensus
    ? sentiment.analystConsensus.replace('_', ' ').replace(/\b\w/g, (char) => char.toUpperCase())
    : 'No Data';

  const volatilitySeverity = categorizeVolatility(priceRangePct);
  const leverageSeverity = categorizeDebt(fundamentals?.debtToEquity);
  const liquiditySeverity = categorizeLiquidity(volumeRatio);
  const sentimentSeverity = (() => {
    const qualitative = categorizeSentiment(result?.sentimentView);
    if (qualitative !== 'unknown') {
      return qualitative;
    }
    if (!sentiment?.analystConsensus) {
      return 'unknown';
    }
    if (sentiment.analystConsensus.includes('sell')) {
      return 'high';
    }
    if (sentiment.analystConsensus.includes('hold')) {
      return 'medium';
    }
    return 'low';
  })();

  const riskFactors: RiskFactor[] = [
    {
      label: 'Leverage',
      value:
        typeof fundamentals?.debtToEquity === 'number' ? `${fundamentals.debtToEquity.toFixed(2)}x` : 'N/A',
      severity: leverageSeverity,
      score: clamp(typeof fundamentals?.debtToEquity === 'number' ? fundamentals.debtToEquity / 2 : 0.45),
      tooltip: 'Based on the debt-to-equity ratio supplied in fundamentals.',
    },
    {
      label: 'Volatility',
      value: typeof priceRangePct === 'number' ? `${priceRangePct.toFixed(0)}% range` : 'N/A',
      severity: volatilitySeverity,
      score: clamp(typeof priceRangePct === 'number' ? priceRangePct / 90 : 0.55),
      tooltip: 'Calculated from the spread between 52-week high and low.',
    },
    {
      label: 'Liquidity',
      value:
        typeof volumeRatio === 'number'
          ? `${volumeRatio.toFixed(2)}x avg volume`
          : 'N/A',
      severity: liquiditySeverity,
      score:
        typeof volumeRatio === 'number'
          ? volumeRatio >= 1.2
            ? 0.3
            : volumeRatio >= 0.8
            ? 0.55
            : 0.85
          : 0.55,
      tooltip: 'Compares latest trading volume to the trailing average.',
    },
    {
      label: 'Sentiment',
      value: sentimentDescriptor,
      severity: sentimentSeverity,
      score:
        sentimentSeverity === 'low' ? 0.35 : sentimentSeverity === 'medium' ? 0.6 : sentimentSeverity === 'high' ? 0.85 : 0.5,
      tooltip: 'Derived from analyst consensus and qualitative sentiment view.',
    },
  ];

  const overallSeverity: Severity =
    riskScore <= 3 ? 'low' : riskScore <= 7 ? 'medium' : 'high';

  const sparklinePoints = riskFactors
    .map((factor, index) => {
      const x = (index / (riskFactors.length - 1 || 1)) * 100;
      const y = 40 - factor.score * 40;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <TooltipProvider>
      <div className="bg-ai-card border border-gray-700 rounded-lg p-6 space-y-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <ShieldAlert className="h-5 w-5 text-ai-accent" />
              <h3 className="text-lg font-semibold text-ai-text">Risk Insights</h3>
            </div>
            <p className="text-sm text-ai-muted">
              Snapshot of leverage, volatility, liquidity, and sentiment drivers behind the current risk score.
            </p>
          </div>

          <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
            <div className={cn('rounded-xl px-5 py-4 text-center min-w-[180px] shadow-inner', severityStyles[overallSeverity].bg)}>
              <div className="text-xs uppercase tracking-wide text-ai-muted">Overall Risk Score</div>
              <div className="text-4xl font-bold text-ai-text mt-1">{riskScore.toFixed?.(1) ?? '0.0'}</div>
              <div className={cn('text-sm font-medium mt-1', severityStyles[overallSeverity].text)}>
                {severityStyles[overallSeverity].label}
              </div>
              <div className="mt-3 h-2 bg-black/40 rounded-full overflow-hidden">
                <div
                  className={cn('h-full transition-all duration-500 bg-gradient-to-r', severityStyles[overallSeverity].bar)}
                  style={{ width: `${(riskScore / 10) * 100}%` }}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm text-ai-muted">
                <Activity className="h-4 w-4 text-ai-accent" />
                Conviction {conviction.toFixed?.(0) ?? 0}%
              </div>
              <div className="flex items-center gap-2 text-sm text-ai-muted">
                <AlertOctagon className="h-4 w-4 text-yellow-400" />
                {result?.scenarios?.uncertaintyComment ?? 'No uncertainty commentary provided.'}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-ai-bg/60 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between text-xs text-ai-muted mb-3">
            <span>Factor Stress Map</span>
            <span>Lower is better</span>
          </div>
          <svg viewBox="0 0 100 40" className="w-full h-16 text-ai-muted">
            <polyline
              points={sparklinePoints}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeOpacity={0.4}
            />
            <polyline
              points={sparklinePoints}
              fill="url(#riskFill)"
              stroke="url(#riskStroke)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <defs>
              <linearGradient id="riskStroke" x1="0" x2="1">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="50%" stopColor="#facc15" />
                <stop offset="100%" stopColor="#f87171" />
              </linearGradient>
              <linearGradient id="riskFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="rgba(248,113,113,0.35)" />
                <stop offset="100%" stopColor="rgba(17,24,39,0)" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {riskFactors.map((factor) => (
            <div key={factor.label} className="bg-ai-bg/50 border border-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-ai-muted">{factor.label}</div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span
                      className={cn(
                        'text-xs font-semibold px-2 py-1 rounded-full border',
                        severityStyles[factor.severity].text,
                        severityStyles[factor.severity].bg,
                      )}
                    >
                      {severityStyles[factor.severity].label}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-[220px] text-xs text-ai-text">{factor.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="text-2xl font-semibold text-ai-text mt-2">{factor.value}</div>
              <div className="mt-4 h-2 bg-black/40 rounded-full overflow-hidden">
                <div
                  className={cn('h-full bg-gradient-to-r', severityStyles[factor.severity].bar)}
                  style={{ width: `${factor.score * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-ai-bg/50 border border-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-sm text-ai-muted mb-3">
              <Droplet className="h-4 w-4 text-ai-accent" />
              Guidance Hotspots
            </div>
            {riskNotes.length > 0 ? (
              <ul className="space-y-2">
                {riskNotes.slice(0, 4).map((note, index) => (
                  <li key={index} className="text-sm text-ai-text bg-black/30 rounded-lg p-3 flex gap-2">
                    <span className="text-ai-accent mt-0.5">•</span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-ai-muted">No specific risk notes were generated for this analysis.</p>
            )}
          </div>

          <div className="bg-ai-bg/50 border border-gray-800 rounded-lg p-4 space-y-3">
            <div className="text-sm text-ai-muted">Interpretation</div>
            <p className="text-sm text-ai-text">
              The engine currently classifies this profile as{' '}
              <span className={cn('font-semibold', severityStyles[overallSeverity].text)}>
                {severityStyles[overallSeverity].label.toLowerCase()}
              </span>{' '}
              risk with {conviction.toFixed?.(0) ?? 0}% short-term conviction. Combine the factor stress map with planning
              guidance before sizing any positions.
            </p>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
