'use client';

import { AlertTriangle, CheckCircle2, Target } from 'lucide-react';
import type { ActiveManagerAction, ActiveManagerRecommendation } from '@/lib/domain/AnalysisTypes';
import { cn } from '@/lib/utils';

interface ActiveManagerCardProps {
  recommendation: ActiveManagerRecommendation | null;
  isLoading?: boolean;
  error?: string | null;
}

const ACTION_THEMES: Record<
  ActiveManagerAction,
  { text: string; badge: string; helper: string }
> = {
  BUY: {
    text: 'text-emerald-400',
    badge: 'bg-emerald-500/10 border border-emerald-500/30',
    helper: 'Framework tilt toward adding exposure or increasing size.',
  },
  HOLD: {
    text: 'text-ai-muted',
    badge: 'bg-gray-700/40 border border-gray-600',
    helper: 'Maintain sizing; focus on monitoring catalysts and risk markers.',
  },
  TRIM: {
    text: 'text-amber-300',
    badge: 'bg-amber-500/10 border border-amber-500/30',
    helper: 'Rebalance toward target weight as conviction moderates.',
  },
  SELL: {
    text: 'text-red-400',
    badge: 'bg-red-500/10 border border-red-500/30',
    helper: 'Framework bias toward exiting or materially reducing exposure.',
  },
};

export function ActiveManagerCard({ recommendation, isLoading = false, error = null }: ActiveManagerCardProps) {
  if (!recommendation && !isLoading && !error) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="bg-ai-card border border-gray-700 rounded-lg p-5">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-ai-primary animate-pulse" />
          <p className="text-sm text-ai-muted">Preparing portfolio-aware guidance...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-700 rounded-lg p-5 text-red-200">
        <p className="text-sm font-semibold uppercase tracking-wide mb-1">Active manager signal</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (!recommendation) {
    return null;
  }

  const theme = ACTION_THEMES[recommendation.primaryAction] ?? ACTION_THEMES.HOLD;
  const rationale = recommendation.rationale ?? [];
  const riskFlags = recommendation.riskFlags ?? [];

  return (
    <div className="bg-ai-card border border-gray-700 rounded-lg p-6 space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-ai-muted">Primary action</p>
          <div className={cn('text-3xl font-bold', theme.text)}>{recommendation.primaryAction}</div>
          <p className="text-xs text-ai-muted mt-1">{theme.helper}</p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-xs uppercase tracking-wide text-ai-muted">Confidence</p>
          <div className="text-3xl font-bold text-ai-text">
            {Number.isFinite(recommendation.confidenceScore)
              ? `${Math.round(recommendation.confidenceScore)}%`
              : '—'}
          </div>
          <p className="text-xs text-ai-muted mt-1">Blends signal strength + portfolio fit</p>
        </div>
      </div>

      <div className={cn('rounded-lg px-4 py-3 bg-ai-bg/60 flex items-start gap-3', theme.badge)}>
        <Target className={cn('h-5 w-5 mt-0.5', theme.text)} />
        <div>
          <p className="text-sm font-semibold text-ai-text">{recommendation.headline}</p>
          {recommendation.frameworkNote && (
            <p className="text-xs text-ai-muted mt-1">{recommendation.frameworkNote}</p>
          )}
        </div>
      </div>

      {rationale.length > 0 && (
        <div>
          <div className="text-sm font-medium text-ai-muted mb-2">Rationale signals</div>
          <ul className="space-y-2">
            {rationale.map((point, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-ai-text bg-ai-bg/50 border border-gray-800 rounded-lg p-3">
                <CheckCircle2 className="h-4 w-4 text-ai-primary mt-0.5 flex-shrink-0" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {riskFlags.length > 0 && (
        <div className="rounded-lg border border-red-700 bg-red-900/15 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-red-200 mb-2">
            <AlertTriangle className="h-4 w-4" />
            Risk Notes
          </div>
          <ul className="space-y-2">
            {riskFlags.map((flag, index) => (
              <li key={index} className="text-sm text-red-100 flex items-start gap-2">
                <span className="text-red-300 mt-0.5">•</span>
                <span>{flag}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-xs text-ai-muted border-t border-gray-800 pt-4">
        Framework-based guidance for educational planning. Not individualized advice—consider your mandate
        and consult licensed professionals before acting.
      </p>
    </div>
  );
}
