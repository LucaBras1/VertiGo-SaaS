'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { scaleIn } from '../animations';
import { cn } from '../utils';

type EmptyStateSize = 'sm' | 'md' | 'lg';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  size?: EmptyStateSize;
  className?: string;
}

const sizeConfig: Record<EmptyStateSize, { icon: string; title: string; description: string; padding: string }> = {
  sm: {
    icon: 'h-10 w-10',
    title: 'text-sm font-medium',
    description: 'text-xs',
    padding: 'py-8 px-4',
  },
  md: {
    icon: 'h-12 w-12',
    title: 'text-base font-semibold',
    description: 'text-sm',
    padding: 'py-12 px-6',
  },
  lg: {
    icon: 'h-16 w-16',
    title: 'text-lg font-semibold',
    description: 'text-base',
    padding: 'py-16 px-8',
  },
};

function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  size = 'md',
  className,
}: EmptyStateProps) {
  const config = sizeConfig[size];

  return (
    <motion.div
      variants={scaleIn}
      initial="hidden"
      animate="visible"
      className={cn(
        'flex flex-col items-center justify-center text-center',
        config.padding,
        className
      )}
    >
      {icon && (
        <div
          className={cn(
            'mb-4 flex items-center justify-center rounded-xl bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500',
            config.icon,
            size === 'lg' ? 'p-4' : 'p-3'
          )}
        >
          {icon}
        </div>
      )}

      <h3 className={cn('text-neutral-900 dark:text-neutral-100', config.title)}>
        {title}
      </h3>

      {description && (
        <p
          className={cn(
            'mt-1.5 max-w-sm text-neutral-500 dark:text-neutral-400',
            config.description
          )}
        >
          {description}
        </p>
      )}

      {(action || secondaryAction) && (
        <div className="mt-5 flex items-center gap-3">
          {action}
          {secondaryAction}
        </div>
      )}
    </motion.div>
  );
}

export { EmptyState };
export type { EmptyStateProps };
