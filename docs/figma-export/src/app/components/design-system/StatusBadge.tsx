import React from 'react';

interface StatusBadgeProps {
  status: 'success' | 'warning' | 'error' | 'info';
  children: React.ReactNode;
  size?: 'sm' | 'md';
}

const statusStyles = {
  success: 'bg-[#00FF66]/10 text-[#00FF66] border-[#00FF66]/20',
  warning: 'bg-[#FBBF24]/10 text-[#FBBF24] border-[#FBBF24]/20',
  error: 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20',
  info: 'bg-[#64748B]/10 text-[#64748B] border-[#64748B]/20',
};

export function StatusBadge({ status, children, size = 'md' }: StatusBadgeProps) {
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-1' : 'text-sm px-3 py-1.5';

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${sizeClass} ${statusStyles[status]}`}
    >
      {children}
    </span>
  );
}
