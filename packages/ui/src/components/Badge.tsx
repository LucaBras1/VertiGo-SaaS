'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-brand-100 text-brand-800 dark:bg-brand-900/30 dark:text-brand-300',
        secondary:
          'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300',
        success:
          'bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-300',
        warning:
          'bg-warning-100 text-warning-800 dark:bg-warning-900/30 dark:text-warning-300',
        danger:
          'bg-error-100 text-error-800 dark:bg-error-900/30 dark:text-error-300',
        info: 'bg-info-100 text-info-800 dark:bg-info-900/30 dark:text-info-300',
        outline:
          'border border-neutral-200 text-neutral-700 bg-transparent dark:border-neutral-700 dark:text-neutral-300',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, dot, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant, size }), className)}
        {...props}
      >
        {dot && (
          <span
            className={cn(
              'mr-1.5 h-1.5 w-1.5 rounded-full',
              variant === 'success' && 'bg-success-500',
              variant === 'warning' && 'bg-warning-500',
              variant === 'danger' && 'bg-error-500',
              variant === 'info' && 'bg-info-500',
              (!variant || variant === 'default') && 'bg-brand-500',
              variant === 'secondary' && 'bg-neutral-500'
            )}
          />
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge, badgeVariants };
