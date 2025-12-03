'use client';

import { StockData } from '@/lib/domain/AnalysisTypes';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface FundamentalsChartProps {
  stock: StockData;
}

export default function FundamentalsChart({ stock }: FundamentalsChartProps) {
  const f = stock?.fundamentals;

  if (!f) {
    return <div className="text-ai-muted text-sm">No data available</div>;
  }

  // Normalize metrics to 0-100 scale for radar chart
  const normalizeMetric = (value: number | undefined, max: number): number => {
    if (!value) return 0;
    return Math.min((value / max) * 100, 100);
  };

  const data = [
    {
      metric: 'Growth',
      value: normalizeMetric(f?.epsGrowthYoYPct, 30),
      fullMark: 100,
    },
    {
      metric: 'Profitability',
      value: normalizeMetric(f?.netMarginPct, 40),
      fullMark: 100,
    },
    {
      metric: 'Cash Flow',
      value: normalizeMetric(f?.freeCashFlowYieldPct, 10),
      fullMark: 100,
    },
    {
      metric: 'Returns',
      value: normalizeMetric(f?.roe, 50),
      fullMark: 100,
    },
    {
      metric: 'Valuation',
      value: f?.forwardPE ? Math.max(0, 100 - normalizeMetric(f.forwardPE, 50)) : 50,
      fullMark: 100,
    },
  ];

  return (
    <ResponsiveContainer width="100%" height={250}>
      <RadarChart data={data} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
        <PolarGrid stroke="#374151" />
        <PolarAngleAxis
          dataKey="metric"
          tick={{ fill: '#9ca3af', fontSize: 11 }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 100]}
          tick={{ fill: '#9ca3af', fontSize: 10 }}
          tickCount={6}
        />
        <Radar
          name="Score"
          dataKey="value"
          stroke="#2563eb"
          fill="#2563eb"
          fillOpacity={0.6}
        />
        <Legend
          wrapperStyle={{ fontSize: 11 }}
          iconType="circle"
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
