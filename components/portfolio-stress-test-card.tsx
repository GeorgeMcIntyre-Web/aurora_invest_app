'use client';

import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import type { PortfolioStressTestResult } from '@/lib/domain/portfolioEngine';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PortfolioStressTestCardProps {
  result: PortfolioStressTestResult | null;
  loading?: boolean;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);

const formatPercent = (value: number) => `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;

export function PortfolioStressTestCard({ result, loading = false }: PortfolioStressTestCardProps) {
  if (!result || result.entries.length === 0) {
    return null;
  }

  const scenarios = [
    {
      label: 'Bull Case',
      value: result.bullValue,
      changePct: result.bullChangePct,
      icon: <TrendingUp className="h-4 w-4 text-emerald-400" />,
    },
    {
      label: 'Base Case',
      value: result.baseValue,
      changePct: result.baseChangePct,
      icon: <Activity className="h-4 w-4 text-ai-accent" />,
    },
    {
      label: 'Bear Case',
      value: result.bearValue,
      changePct: result.bearChangePct,
      icon: <TrendingDown className="h-4 w-4 text-red-400" />,
    },
  ];

  const topDrivers = [...result.entries]
    .sort((a, b) => {
      const aSpan = Math.abs(a.bullValue - a.bearValue);
      const bSpan = Math.abs(b.bullValue - b.bearValue);
      return bSpan - aSpan;
    })
    .slice(0, 3);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Portfolio Stress Test</span>
          {loading && <span className="text-xs text-ai-muted">Updating…</span>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {scenarios.map((scenario) => (
            <div
              key={scenario.label}
              className="rounded-lg border border-gray-800 bg-ai-bg p-4 space-y-2"
            >
              <div className="flex items-center gap-2 text-sm text-ai-muted">
                {scenario.icon}
                <span>{scenario.label}</span>
              </div>
              <p className="text-2xl font-semibold text-ai-text">{formatCurrency(scenario.value)}</p>
              <p
                className={
                  scenario.changePct >= 0 ? 'text-sm text-emerald-400' : 'text-sm text-red-400'
                }
              >
                {formatPercent(scenario.changePct)} vs. current
              </p>
            </div>
          ))}
        </div>

        {topDrivers.length > 0 && (
          <div>
            <p className="text-xs uppercase text-ai-muted mb-2">Top Scenario Drivers</p>
            <div className="space-y-2">
              {topDrivers.map((entry) => {
                const spread = entry.bullValue - entry.bearValue;
                return (
                  <div
                    key={entry.ticker}
                    className="flex items-center justify-between rounded-md border border-gray-800 px-3 py-2 text-sm"
                  >
                    <span className="font-semibold text-ai-text">{entry.ticker}</span>
                    <span className="text-ai-muted">
                      {formatCurrency(entry.currentValue)} → Δ {formatCurrency(spread)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
