'use client';

import * as React from 'react';
import { cn } from '../utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'line' | 'circle' | 'rect';
  width?: string | number;
  height?: string | number;
}

function Skeleton({ className, variant = 'line', width, height, ...props }: SkeletonProps) {
  const variantClasses = {
    line: 'h-4 rounded-md',
    circle: 'rounded-full',
    rect: 'rounded-lg',
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-neutral-100 dark:bg-neutral-800',
        'after:absolute after:inset-0',
        'after:bg-gradient-to-r after:from-transparent after:via-white/40 after:to-transparent dark:after:via-white/5',
        'after:animate-shimmer',
        variantClasses[variant],
        className
      )}
      style={{ width, height }}
      {...props}
    />
  );
}

function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  const widths = ['100%', '92%', '78%', '85%', '66%'];
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} style={{ width: widths[i % widths.length] }} />
      ))}
    </div>
  );
}

function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-xl border border-neutral-200 p-6 dark:border-neutral-800', className)}>
      <div className="flex items-center gap-3 mb-4">
        <Skeleton variant="circle" width={40} height={40} />
        <div className="flex-1 space-y-2">
          <Skeleton style={{ width: '50%' }} />
          <Skeleton className="h-3" style={{ width: '30%' }} />
        </div>
      </div>
      <SkeletonText lines={2} />
    </div>
  );
}

function SkeletonTable({ rows = 5, columns = 4, className }: { rows?: number; columns?: number; className?: string }) {
  return (
    <div className={cn('rounded-xl border border-neutral-200 overflow-hidden dark:border-neutral-800', className)}>
      <div className="border-b border-neutral-200 bg-neutral-50 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex gap-4">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-3" style={{ width: `${100 / columns}%` }} />
          ))}
        </div>
      </div>
      {Array.from({ length: rows }).map((_, row) => (
        <div
          key={row}
          className="flex gap-4 border-b border-neutral-100 px-4 py-3 last:border-0 dark:border-neutral-800"
        >
          {Array.from({ length: columns }).map((_, col) => (
            <Skeleton
              key={col}
              style={{ width: `${100 / columns}%` }}
              className={col === 0 ? 'h-4' : 'h-3'}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function SkeletonDashboard({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-6', className)}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-neutral-200 p-5 dark:border-neutral-800">
            <Skeleton className="h-3 mb-3" style={{ width: '40%' }} />
            <Skeleton className="h-8 mb-2" style={{ width: '60%' }} />
            <Skeleton className="h-3" style={{ width: '50%' }} />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-neutral-200 p-6 dark:border-neutral-800">
          <Skeleton className="h-5 mb-4" style={{ width: '30%' }} />
          <Skeleton variant="rect" height={200} />
        </div>
        <SkeletonCard />
      </div>
    </div>
  );
}

export { Skeleton, SkeletonText, SkeletonCard, SkeletonTable, SkeletonDashboard };
