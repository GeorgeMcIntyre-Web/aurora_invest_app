'use client';

import { useMemo } from 'react';
import { HistoricalData } from '@/lib/domain/AnalysisTypes';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

type HistoricalPeriod = HistoricalData['period'];

const PERIOD_OPTIONS: HistoricalPeriod[] = ['1M', '3M', '6M', '1Y', '5Y'];

interface HistoricalChartProps {
  data: HistoricalData | null;
  selectedPeriod: HistoricalPeriod;
  onPeriodChange?: (period: HistoricalPeriod) => void;
  height?: number;
  isLoading?: boolean;
  error?: string | null;
}

const formatDateForPeriod = (date: Date, period: HistoricalPeriod) => {
  if (period === '1M') {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  if (period === '3M' || period === '6M') {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
};

export function HistoricalChart({
  data,
  selectedPeriod,
  onPeriodChange,
  height = 320,
  isLoading = false,
  error = null,
}: HistoricalChartProps) {
  const formattedData = useMemo(() => {
    if (!data?.dataPoints?.length) {
      return [];
    }

    return data.dataPoints.map((point) => {
      const parsed = new Date(point.date);
      const label = Number.isNaN(parsed.getTime())
        ? point.date
        : formatDateForPeriod(parsed, data.period);

      return {
        date: label,
        price: Number((point.price ?? 0).toFixed(2)),
        volume: point.volume ?? 0,
      };
    });
  }, [data]);

  const handlePeriodChange = (period: HistoricalPeriod) => {
    if (period === selectedPeriod) {
      return;
    }
    onPeriodChange?.(period);
  };

  const showEmptyState = !formattedData.length && !isLoading && !error;

  return (
    <div className="bg-ai-card border border-gray-700 rounded-lg p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-ai-muted uppercase tracking-wide">
            Historical Performance
          </p>
          <p className="text-lg text-ai-text font-semibold">Price & Volume</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {PERIOD_OPTIONS.map((period) => {
            const isActive = period === selectedPeriod;
            return (
              <button
                key={period}
                type="button"
                onClick={() => handlePeriodChange(period)}
                className={`px-3 py-1.5 text-sm rounded-full border transition ${
                  isActive
                    ? 'bg-ai-primary text-white border-ai-primary shadow'
                    : 'border-gray-600 text-ai-muted hover:border-ai-primary hover:text-ai-primary'
                }`}
                disabled={isLoading && !isActive}
              >
                {period}
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-700 bg-red-900/20 px-3 py-2 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="mt-6" style={{ minHeight: height }}>
        {isLoading && (
          <div className="flex h-[280px] items-center justify-center rounded-lg border border-dashed border-gray-700 bg-ai-bg text-sm text-ai-muted">
            Loading historical data...
          </div>
        )}

        {showEmptyState && (
          <div className="flex h-[280px] items-center justify-center rounded-lg border border-dashed border-gray-700 bg-ai-bg text-sm text-ai-muted">
            Historical data unavailable for this period.
          </div>
        )}

        {!isLoading && formattedData.length > 0 && (
          <ResponsiveContainer width="100%" height={height}>
            <ComposedChart data={formattedData} margin={{ top: 20, right: 20, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="historicalPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#9ca3af', fontSize: 11 }}
                interval="preserveStartEnd"
              />
              <YAxis
                yAxisId="left"
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#9ca3af', fontSize: 11 }}
                tickFormatter={(value) => `$${value}`}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#9ca3af', fontSize: 11 }}
                tickFormatter={(value) =>
                  value >= 1_000_000 ? `${(value / 1_000_000).toFixed(1)}M` : `${(value / 1_000).toFixed(0)}K`
                }
              />
              <Tooltip
                cursor={{ stroke: '#334155', strokeWidth: 1 }}
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #1f2937',
                  borderRadius: '0.75rem',
                }}
                labelStyle={{ color: '#e5e7eb', fontSize: 12 }}
                itemStyle={{ color: '#e5e7eb', fontSize: 12 }}
                formatter={(value, name) => {
                  if (name === 'Price') {
                    return [`$${Number(value).toFixed(2)}`, 'Price'];
                  }
                  if (name === 'Volume') {
                    const num = Number(value);
                    if (num >= 1_000_000) {
                      return [`${(num / 1_000_000).toFixed(2)}M`, 'Volume'];
                    }
                    return [`${(num / 1_000).toFixed(0)}K`, 'Volume'];
                  }
                  return [value, name];
                }}
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="price"
                name="Price"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#historicalPrice)"
                animationDuration={300}
                dot={false}
              />
              <Bar
                yAxisId="right"
                dataKey="volume"
                name="Volume"
                fill="#2563eb33"
                stroke="#3b82f6"
                barSize={10}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

