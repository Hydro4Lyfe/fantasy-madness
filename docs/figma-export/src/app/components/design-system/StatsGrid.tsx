import React from 'react';

interface StatItem {
  label: string;
  value: string;
  change?: {
    value: string;
    isPositive: boolean;
  };
}

interface StatsGridProps {
  stats: StatItem[];
  columns?: 2 | 3 | 4;
}

export function StatsGrid({ stats, columns = 3 }: StatsGridProps) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-6`}>
      {stats.map((stat, index) => (
        <div key={index} className="space-y-2">
          <p className="text-sm text-muted-foreground">{stat.label}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold">{stat.value}</span>
            {stat.change && (
              <span
                className={`text-sm font-medium ${
                  stat.change.isPositive ? 'text-[#00FF66]' : 'text-destructive'
                }`}
              >
                {stat.change.value}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
