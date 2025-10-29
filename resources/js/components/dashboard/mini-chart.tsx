import { cn } from '@/lib/utils';
import {
  Area,
  AreaChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface DataPoint {
  name: string;
  value: number;
}

interface MiniChartProps {
  data: DataPoint[];
  type?: 'area' | 'line';
  color?: string;
  height?: number;
  className?: string;
}

export function MiniChart({
  data,
  type = 'area',
  color = 'hsl(var(--primary))',
  height = 60,
  className,
}: MiniChartProps) {
  if (data.length === 0) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-muted/30',
          className,
        )}
        style={{ height }}
      >
        <p className="text-xs text-muted-foreground">No data</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height} className={className}>
      {type === 'area' ? (
        <AreaChart data={data}>
          <defs>
            <linearGradient id="miniChartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Tooltip
            contentStyle={{
              background: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px',
              fontSize: '12px',
            }}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill="url(#miniChartGradient)"
          />
        </AreaChart>
      ) : (
        <LineChart data={data}>
          <Tooltip
            contentStyle={{
              background: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px',
              fontSize: '12px',
            }}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      )}
    </ResponsiveContainer>
  );
}
