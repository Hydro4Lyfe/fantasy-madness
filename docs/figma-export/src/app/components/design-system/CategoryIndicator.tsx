import React from 'react';

interface CategoryIndicatorProps {
  color: 'purple' | 'yellow' | 'green' | 'gray';
  label: string;
  value: string;
  description?: string;
}

const colorMap = {
  purple: '#A855F7',
  yellow: '#FBBF24',
  green: '#00FF66',
  gray: '#64748B',
};

export function CategoryIndicator({ color, label, value, description }: CategoryIndicatorProps) {
  return (
    <div className="flex items-start gap-3">
      <div
        className="w-10 h-10 rounded-full flex-shrink-0 mt-1"
        style={{ backgroundColor: colorMap[color] }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-base font-medium mt-0.5">{value}</p>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </div>
    </div>
  );
}
