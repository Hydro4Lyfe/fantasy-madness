import React from 'react';
import { Card } from '@/app/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  change?: {
    value: string;
    isPositive: boolean;
  };
  subtitle?: string;
}

export function MetricCard({ title, value, change, subtitle }: MetricCardProps) {
  return (
    <Card className="p-6 bg-card border border-border">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">{title}</p>
        <div className="flex items-end gap-3">
          <h2 className="text-5xl font-semibold tracking-tight">{value}</h2>
          {change && (
            <div className={`flex items-center gap-1 pb-2 ${change.isPositive ? 'text-[#00FF66]' : 'text-destructive'}`}>
              {change.isPositive ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">{change.value}</span>
            </div>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </Card>
  );
}
