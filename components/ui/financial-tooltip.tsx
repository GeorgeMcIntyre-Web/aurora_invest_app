'use client';

import * as React from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Info, AlertCircle } from 'lucide-react';

export type MetricType = 'percentage' | 'currency' | 'ratio' | 'number' | 'score';
export type TrendDirection = 'up' | 'down' | 'neutral';
export type Sentiment = 'positive' | 'negative' | 'neutral' | 'warning';

interface FinancialMetric {
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

interface FinancialTooltipProps {
  metric: FinancialMetric;
  children: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
  showIcon?: boolean;
}

const sentimentStyles: Record<Sentiment, { text: string; bg: string; icon: string }> = {
  positive: {
    text: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/30',
    icon: 'text-emerald-400',
  },
  negative: {
    text: 'text-red-400',
    bg: 'bg-red-500/10 border-red-500/30',
    icon: 'text-red-400',
  },
  warning: {
    text: 'text-yellow-400',
    bg: 'bg-yellow-500/10 border-yellow-500/30',
    icon: 'text-yellow-400',
  },
  neutral: {
    text: 'text-ai-muted',
    bg: 'bg-ai-bg/50 border-gray-700',
    icon: 'text-ai-muted',
  },
};

const formatValue = (value: number | string, type?: MetricType): string => {
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
};

export function FinancialTooltip({
  metric,
  children,
  side = 'top',
  className,
  showIcon = true,
}: FinancialTooltipProps) {
  const sentiment = metric.sentiment || 'neutral';
  const styles = sentimentStyles[sentiment];

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={cn('cursor-help inline-flex items-center gap-1', className)}>
          {children}
          {showIcon && <Info className="h-3 w-3 text-ai-muted opacity-50 hover:opacity-100 transition-opacity" />}
        </span>
      </TooltipTrigger>
      <TooltipContent side={side} className="max-w-xs">
        <div className="space-y-2">
          {/* Header with Label */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-ai-text">{metric.label}</span>
            {metric.trend && (
              <span className={cn('flex items-center text-xs', styles.text)}>
                {metric.trend === 'up' ? (
                  <TrendingUp className="h-3 w-3" />
                ) : metric.trend === 'down' ? (
                  <TrendingDown className="h-3 w-3" />
                ) : null}
              </span>
            )}
          </div>

          {/* Value */}
          <div className={cn('text-lg font-bold', styles.text)}>
            {formatValue(metric.value, metric.type)}
          </div>

          {/* Change indicator */}
          {typeof metric.change === 'number' && (
            <div className={cn('text-xs flex items-center gap-1', styles.text)}>
              {metric.change > 0 ? (
                <>
                  <TrendingUp className="h-3 w-3" />
                  <span>+{metric.change.toFixed(2)}%</span>
                </>
              ) : metric.change < 0 ? (
                <>
                  <TrendingDown className="h-3 w-3" />
                  <span>{metric.change.toFixed(2)}%</span>
                </>
              ) : (
                <span>No change</span>
              )}
              {metric.changeLabel && <span className="text-ai-muted">({metric.changeLabel})</span>}
            </div>
          )}

          {/* Description */}
          {metric.description && (
            <p className="text-xs text-ai-muted leading-relaxed">{metric.description}</p>
          )}

          {/* Benchmark */}
          {metric.benchmark && (
            <div className={cn('text-xs px-2 py-1 rounded border', styles.bg)}>
              <span className="text-ai-muted">Benchmark: </span>
              <span className={styles.text}>
                {typeof metric.benchmark === 'number'
                  ? formatValue(metric.benchmark, metric.type)
                  : metric.benchmark}
              </span>
            </div>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

// Specialized variants for common financial metrics

interface MetricTooltipProps {
  label: string;
  value: number | string;
  description: string;
  benchmark?: string | number;
  children: React.ReactNode;
  type?: MetricType;
  sentiment?: Sentiment;
  trend?: TrendDirection;
  change?: number;
  changeLabel?: string;
}

export function MetricTooltip(props: MetricTooltipProps) {
  return (
    <FinancialTooltip
      metric={{
        label: props.label,
        value: props.value,
        type: props.type,
        description: props.description,
        benchmark: props.benchmark,
        sentiment: props.sentiment,
        trend: props.trend,
        change: props.change,
        changeLabel: props.changeLabel,
      }}
    >
      {props.children}
    </FinancialTooltip>
  );
}

// Quick tooltip for simple metrics
interface QuickMetricTooltipProps {
  label: string;
  value: number | string;
  description: string;
  children: React.ReactNode;
}

export function QuickMetricTooltip({ label, value, description, children }: QuickMetricTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="cursor-help">{children}</span>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <div className="space-y-1">
          <div className="text-xs font-semibold text-ai-text">{label}</div>
          <div className="text-sm font-medium text-ai-accent">{value}</div>
          <p className="text-xs text-ai-muted">{description}</p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

// Risk-level tooltip with color coding
interface RiskTooltipProps {
  riskLevel: 'low' | 'medium' | 'high';
  value: number;
  description: string;
  children: React.ReactNode;
}

const riskSentimentMap = {
  low: 'positive' as Sentiment,
  medium: 'warning' as Sentiment,
  high: 'negative' as Sentiment,
};

export function RiskTooltip({ riskLevel, value, description, children }: RiskTooltipProps) {
  return (
    <FinancialTooltip
      metric={{
        label: `${riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} Risk`,
        value: value,
        type: 'score',
        description,
        sentiment: riskSentimentMap[riskLevel],
      }}
      showIcon={true}
    >
      {children}
    </FinancialTooltip>
  );
}
