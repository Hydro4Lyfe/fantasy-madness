import React from 'react';
import { Badge } from '@/app/components/ui/badge';

interface ProductListItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  price: string;
  badge?: {
    text: string;
    variant?: 'default' | 'success' | 'destructive';
  };
  onClick?: () => void;
}

export function ProductListItem({ icon, title, subtitle, price, badge, onClick }: ProductListItemProps) {
  return (
    <div
      className="flex items-center justify-between p-4 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{title}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="text-sm font-medium">{price}</span>
        {badge && (
          <Badge
            variant={badge.variant === 'success' ? 'default' : badge.variant}
            className={badge.variant === 'success' ? 'bg-[#00FF66] text-[#0A0A0F] hover:bg-[#00FF66]/90' : ''}
          >
            {badge.text}
          </Badge>
        )}
      </div>
    </div>
  );
}
