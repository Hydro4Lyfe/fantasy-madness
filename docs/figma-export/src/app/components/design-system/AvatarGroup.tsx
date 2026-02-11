import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';

interface User {
  name: string;
  avatar?: string;
}

interface AvatarGroupProps {
  users: User[];
  max?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function AvatarGroup({ users, max = 5, size = 'md' }: AvatarGroupProps) {
  const displayUsers = users.slice(0, max);
  const remaining = users.length - max;

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  return (
    <div className="flex items-center -space-x-3">
      {displayUsers.map((user, index) => {
        const initials = user.name
          .split(' ')
          .map(n => n[0])
          .join('')
          .toUpperCase();

        return (
          <Avatar
            key={index}
            className={`${sizeClasses[size]} border-2 border-background`}
          >
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-muted text-muted-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
        );
      })}
      {remaining > 0 && (
        <div
          className={`${sizeClasses[size]} rounded-full bg-muted border-2 border-background flex items-center justify-center`}
        >
          <span className="text-muted-foreground font-medium">+{remaining}</span>
        </div>
      )}
    </div>
  );
}
