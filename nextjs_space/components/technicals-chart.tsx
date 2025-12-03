'use client';

import { StockData } from '@/lib/domain/AnalysisTypes';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface TechnicalsChartProps {
  stock: StockData;
}

export default function TechnicalsChart({ stock }: TechnicalsChartProps) {
  const t = stock?.technicals;

  if (!t) {
    return <div className="text-ai-muted text-sm">No data available</div>;
  }

  const price = t?.price ?? 0;
  const sma20 = t?.sma20 ?? price;
  const sma50 = t?.sma50 ?? price;
  const sma200 = t?.sma200 ?? price;

  // Create mock historical data for visualization
  // In production, this would come from actual historical data
  const generateHistoricalData = () => {
    const data = [];
    const days = 60;

    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      // Simple interpolation for visualization
      const progress = (days - i) / days;
      const pricePoint = sma200 + (price - sma200) * progress;
      const sma20Point = sma200 + (sma20 - sma200) * progress;
      const sma50Point = sma200 + (sma50 - sma200) * progress;

      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        price: Number(pricePoint?.toFixed?.(2) ?? 0),
        sma20: Number(sma20Point?.toFixed?.(2) ?? 0),
        sma50: Number(sma50Point?.toFixed?.(2) ?? 0),
        sma200: Number(sma200?.toFixed?.(2) ?? 0),
      });
    }

    return data;
  };

  const data = generateHistoricalData();

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
        <XAxis
          dataKey="date"
          tick={{ fill: '#9ca3af', fontSize: 10 }}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fill: '#9ca3af', fontSize: 10 }}
          tickLine={false}
          domain={['auto', 'auto']}
          label={{ value: 'Price ($)', angle: -90, position: 'insideLeft', style: { fill: '#9ca3af', fontSize: 11 } }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1e293b',
            border: '1px solid #374151',
            borderRadius: '8px',
            fontSize: 11,
          }}
          labelStyle={{ color: '#e5e7eb' }}
          itemStyle={{ color: '#e5e7eb' }}
        />
        <Legend
          wrapperStyle={{ fontSize: 11 }}
          iconType="line"
        />
        <Line
          type="monotone"
          dataKey="price"
          stroke="#10b981"
          strokeWidth={2}
          dot={false}
          name="Current Price"
        />
        <Line
          type="monotone"
          dataKey="sma20"
          stroke="#60B5FF"
          strokeWidth={1.5}
          strokeDasharray="5 5"
          dot={false}
          name="SMA 20"
        />
        <Line
          type="monotone"
          dataKey="sma50"
          stroke="#FF9149"
          strokeWidth={1.5}
          strokeDasharray="5 5"
          dot={false}
          name="SMA 50"
        />
        <Line
          type="monotone"
          dataKey="sma200"
          stroke="#A19AD3"
          strokeWidth={1.5}
          strokeDasharray="5 5"
          dot={false}
          name="SMA 200"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
