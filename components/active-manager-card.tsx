'use client';

import type { ActiveManagerRecommendation } from '@/lib/domain/AnalysisTypes';
import { ACTIVE_MANAGER_DISCLAIMER } from '@/lib/domain/AnalysisTypes';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Target,
} from 'lucide-react';

interface ActiveManagerCardProps {
  recommendation: ActiveManagerRecommendation | null;
  loading?: boolean;
  error?: string | null;
}

export function ActiveManagerCard({
  recommendation,
  loading = false,
  error = null,
}: ActiveManagerCardProps) {
  if (loading) {
    return (
      <div className="bg-ai-card border border-gray-700 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-5 h-5 rounded-full border-2 border-ai-primary/30 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full border-b-2 border-ai-primary animate-spin" />
          </div>
          <h3 className="text-lg font-semibold text-ai-text">
            Active Manager Recommendation
          </h3>
        </div>
        <p className="text-sm text-ai-muted">Generating recommendation...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-ai-card border border-red-700/50 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-2">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          <h3 className="text-lg font-semibold text-red-400">
            Active Manager Unavailable
          </h3>
        </div>
        <p className="text-sm text-red-300/80">{error}</p>
      </div>
    );
  }

  if (!recommendation) {
    return (
      <div className="bg-ai-card border border-gray-700 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Target className="h-6 w-6 text-ai-primary" />
          <h3 className="text-lg font-semibold text-ai-text">
            Active Manager Recommendation
          </h3>
        </div>
        <p className="text-sm text-ai-muted">
          Run an analysis to see Active Manager recommendations for this stock.
        </p>
      </div>
    );
  }

  const getActionIcon = () => {
    if (recommendation.primaryAction === 'buy') {
      return <TrendingUp className="w-5 h-5 text-green-400" />;
    }
    if (recommendation.primaryAction === 'sell') {
      return <TrendingDown className="w-5 h-5 text-red-400" />;
    }
    if (recommendation.primaryAction === 'trim') {
      return <TrendingDown className="w-5 h-5 text-yellow-400" />;
    }
    return <Minus className="w-5 h-5 text-gray-400" />;
  };

  const getConfidenceColor = () => {
    if (recommendation.confidenceScore >= 70) {
      return 'text-green-400';
    }
    if (recommendation.confidenceScore >= 40) {
      return 'text-yellow-400';
    }
    return 'text-gray-400';
  };

  const getActionColor = () => {
    if (recommendation.primaryAction === 'buy') {
      return 'text-green-400';
    }
    if (recommendation.primaryAction === 'sell') {
      return 'text-red-400';
    }
    if (recommendation.primaryAction === 'trim') {
      return 'text-yellow-400';
    }
    return 'text-gray-400';
  };

  return (
    <div className="bg-ai-card border border-gray-700 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <Target className="h-6 w-6 text-ai-primary" />
        <h2 className="text-xl font-bold text-ai-text">
          Active Manager Recommendation
        </h2>
      </div>

      <div className="space-y-6">
        {/* Headline */}
        <div className="bg-ai-bg rounded-lg p-4">
          <p className="text-lg font-semibold text-ai-text">
            {recommendation.headline}
          </p>
          <p className="text-sm text-ai-muted mt-1">
            Timeframe: {recommendation.timeframe.replace('_', ' ')}
          </p>
        </div>

        {/* Action + Confidence */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-ai-bg rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              {getActionIcon()}
              <span className="text-sm text-ai-muted">Suggested Action</span>
            </div>
            <p className={`text-2xl font-bold ${getActionColor()}`}>
              {recommendation.primaryAction.charAt(0).toUpperCase() +
                recommendation.primaryAction.slice(1)}
            </p>
          </div>

          <div className="bg-ai-bg rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-ai-accent" />
              <span className="text-sm text-ai-muted">Confidence Score</span>
            </div>
            <p className={`text-2xl font-bold ${getConfidenceColor()}`}>
              {recommendation.confidenceScore}/100
            </p>
          </div>
        </div>

        {/* Rationale */}
        <div>
          <h4 className="text-sm font-semibold text-ai-text mb-3">
            Framework Rationale
          </h4>
          <ul className="space-y-2">
            {recommendation.rationale.map((item, idx) => (
              <li
                key={idx}
                className="text-sm text-ai-text bg-ai-bg p-3 rounded-lg flex items-start gap-2"
              >
                <span className="text-ai-accent mt-0.5">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Risk Flags */}
        {recommendation.riskFlags.length > 0 && (
          <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
              <h4 className="text-sm font-semibold text-yellow-400">
                Risk Considerations
              </h4>
            </div>
            <ul className="space-y-2">
              {recommendation.riskFlags.map((flag, idx) => (
                <li key={idx} className="text-sm text-yellow-200/90 flex items-start gap-2">
                  <span className="text-yellow-400 mt-0.5">⚠</span>
                  <span>{flag}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Notes */}
        {recommendation.notes && recommendation.notes.length > 0 && (
          <div className="text-xs text-ai-muted space-y-1">
            {recommendation.notes.map((note, idx) => (
              <p key={idx} className="bg-ai-bg p-2 rounded">
                {note}
              </p>
            ))}
          </div>
        )}

        {/* Disclaimer */}
        <div className="text-xs text-ai-muted pt-4 border-t border-gray-700">
          <p className="flex items-start gap-2">
            <AlertTriangle className="w-3 h-3 text-yellow-500 mt-0.5 flex-shrink-0" />
            <span>{ACTIVE_MANAGER_DISCLAIMER}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
