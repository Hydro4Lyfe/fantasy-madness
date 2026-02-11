import React from 'react';
import { Card } from '@/app/components/ui/card';

interface BarData {
  label: string;
  value: number;
  isHighlighted?: boolean;
}

interface BarChartProps {
  title: string;
  subtitle?: string;
  data: BarData[];
  maxValue?: number;
  highlightedValue?: string;
}

export function BarChart({ title, subtitle, data, maxValue, highlightedValue }: BarChartProps) {
  const max = maxValue || Math.max(...data.map(d => d.value));

  return (
    <Card className="p-6 bg-card border border-border">
      <div className="space-y-6">
        <div>
          <h3 className="text-base font-medium">{title}</h3>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        
        {highlightedValue && (
          <div className="flex items-end gap-2">
            <span className="text-3xl font-semibold">{highlightedValue}</span>
            <span className="text-sm text-muted-foreground pb-1">this month</span>
          </div>
        )}

        <div className="flex items-end justify-between gap-3 h-32">
          {data.map((bar, index) => (
            <div key={index} className="flex flex-col items-center gap-2 flex-1">
              <div className="w-full flex items-end justify-center h-full">
                <div
                  className={`w-full rounded-t-md transition-all ${
                    bar.isHighlighted
                      ? 'bg-[#00FF66]'
                      : 'bg-[#27272F]'
                  }`}
                  style={{ height: `${(bar.value / max) * 100}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">{bar.label}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
