'use client';

import { ScenarioSummary } from '@/lib/domain/AnalysisTypes';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';

interface ScenarioChartProps {
  scenarios: ScenarioSummary;
}

export default function ScenarioChart({ scenarios }: ScenarioChartProps) {
  if (!scenarios) {
    return <div className="text-ai-muted">No scenario data available</div>;
  }

  const data = [
    {
      name: 'Bear',
      min: scenarios?.bear?.expectedReturnPctRange?.[0] ?? 0,
      max: scenarios?.bear?.expectedReturnPctRange?.[1] ?? 0,
      probability: scenarios?.bear?.probabilityPct ?? 0,
      color: '#dc2626',
    },
    {
      name: 'Base',
      min: scenarios?.base?.expectedReturnPctRange?.[0] ?? 0,
      max: scenarios?.base?.expectedReturnPctRange?.[1] ?? 0,
      probability: scenarios?.base?.probabilityPct ?? 0,
      color: '#2563eb',
    },
    {
      name: 'Bull',
      min: scenarios?.bull?.expectedReturnPctRange?.[0] ?? 0,
      max: scenarios?.bull?.expectedReturnPctRange?.[1] ?? 0,
      probability: scenarios?.bull?.probabilityPct ?? 0,
      color: '#10b981',
    },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <XAxis
          dataKey="name"
          tick={{ fill: '#9ca3af', fontSize: 12 }}
          tickLine={false}
          axisLine={{ stroke: '#374151' }}
        />
        <YAxis
          tick={{ fill: '#9ca3af', fontSize: 12 }}
          tickLine={false}
          axisLine={{ stroke: '#374151' }}
          label={{ value: 'Return (%)', angle: -90, position: 'insideLeft', style: { fill: '#9ca3af', fontSize: 12 } }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1e293b',
            border: '1px solid #374151',
            borderRadius: '8px',
            fontSize: 12,
          }}
          labelStyle={{ color: '#e5e7eb' }}
          itemStyle={{ color: '#e5e7eb' }}
        />
        <Legend
          wrapperStyle={{ fontSize: 12 }}
          iconType="circle"
        />
        <ReferenceLine y={0} stroke="#6b7280" strokeDasharray="3 3" />
        <Bar dataKey="min" name="Min Return (%)" radius={[4, 4, 0, 0]}>
          {data?.map((entry, index) => (
            <Cell key={`cell-min-${index}`} fill={entry?.color ?? '#2563eb'} />
          ))}
        </Bar>
        <Bar dataKey="max" name="Max Return (%)" radius={[4, 4, 0, 0]}>
          {data?.map((entry, index) => (
            <Cell key={`cell-max-${index}`} fill={entry?.color ?? '#2563eb'} fillOpacity={0.6} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
