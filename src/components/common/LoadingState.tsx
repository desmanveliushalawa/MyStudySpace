import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const LoadingState: React.FC<{ rows?: number }> = ({ rows = 3 }) => {
  return (
    <div className="space-y-4 w-full">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-border/60 bg-card p-5 space-y-3"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-4 w-3/4" />
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
};

