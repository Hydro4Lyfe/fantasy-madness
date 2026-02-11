import React from 'react';
import { Card } from '@/app/components/ui/card';
import {
  Area,
  AreaChart as RechartsAreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface AreaChartProps {
  title?: string;
  data: Array<{ name: string; value: number }>;
  color?: string;
  height?: number;
  showGrid?: boolean;
  showTooltip?: boolean;
}

export function AreaChart({
  title,
  data,
  color = '#00FF66',
  height = 200,
  showGrid = false,
  showTooltip = true,
}: AreaChartProps) {
  return (
    <Card className="p-6 bg-card border border-border">
      {title && <h3 className="text-base font-medium mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsAreaChart data={data}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#27272F" />}
          <XAxis
            dataKey="name"
            stroke="#A1A1AA"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#A1A1AA"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          {showTooltip && (
            <Tooltip
              contentStyle={{
                backgroundColor: '#16161D',
                border: '1px solid #27272F',
                borderRadius: '8px',
                color: '#FAFAFA',
              }}
            />
          )}
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill={color}
            fillOpacity={0.2}
          />
        </RechartsAreaChart>
      </ResponsiveContainer>
    </Card>
  );
}
