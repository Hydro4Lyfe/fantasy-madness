import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';

interface CommentItemProps {
  author: {
    name: string;
    avatar?: string;
    role?: string;
  };
  content: string;
  timestamp?: string;
  metadata?: string;
}

export function CommentItem({ author, content, timestamp, metadata }: CommentItemProps) {
  const initials = author.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  return (
    <div className="flex gap-3 p-4 rounded-lg hover:bg-accent/30 transition-colors">
      <Avatar className="w-10 h-10 flex-shrink-0">
        <AvatarImage src={author.avatar} alt={author.name} />
        <AvatarFallback className="bg-muted text-muted-foreground text-xs">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{author.name}</span>
          {timestamp && (
            <span className="text-xs text-muted-foreground">{timestamp}</span>
          )}
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{content}</p>
        {metadata && (
          <p className="text-xs text-muted-foreground">{metadata}</p>
        )}
      </div>
    </div>
  );
}
