'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface DailyClick {
  date: string;
  clicks: number;
}

interface Props {
  data: DailyClick[];
}

// Custom tooltip shown on hover
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  return (
    <div style={{
      background: '#1C1C27',
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: '8px',
      padding: '10px 14px',
    }}>
      <p style={{ fontSize: '12px', color: '#8B8BA8', marginBottom: '4px' }}>
        {label}
      </p>
      <p style={{ fontSize: '16px', fontWeight: '700', color: '#60A5FA' }}>
        {payload[0].value} {payload[0].value === 1 ? 'click' : 'clicks'}
      </p>
    </div>
  );
}

// Format date from YYYY-MM-DD to "May 27"
function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function ClicksChart({ data }: Props) {
  const formatted = data.map(d => ({
    date:   formatDate(d.date),
    clicks: d.clicks,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart
        data={formatted}
        margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
        barCategoryGap="35%"
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(255,255,255,0.05)"
          vertical={false}
        />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: '#4A4A6A' }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 11, fill: '#4A4A6A' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ fill: 'rgba(59, 130, 246, 0.06)' }}
        />
        <Bar
          dataKey="clicks"
          fill="#3B82F6"
          radius={[4, 4, 0, 0]}
          maxBarSize={48}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
