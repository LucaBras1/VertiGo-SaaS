'use client';

import * as React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { spring } from '@vertigo/design-tokens';
import { cn } from '../utils';

type CardVariant = 'default' | 'ai' | 'insight' | 'glass' | 'gradient' | 'spotlight' | 'interactive';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  hover?: boolean;
  animated?: boolean;
}

const variantClasses: Record<CardVariant, string> = {
  default:
    'bg-white border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800',
  ai: 'bg-gradient-to-br from-violet-50 to-blue-50 border-violet-200/60 dark:from-violet-950/20 dark:to-blue-950/20 dark:border-violet-800/40',
  insight:
    'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200/60 dark:from-amber-950/20 dark:to-orange-950/20 dark:border-amber-800/40',
  glass:
    'bg-white/60 backdrop-blur-xl border-white/20 dark:bg-neutral-900/60 dark:border-neutral-700/30',
  gradient:
    'bg-gradient-to-br from-brand-50 via-white to-accent-50 border-brand-100 dark:from-brand-950/20 dark:via-neutral-900 dark:to-accent-950/20 dark:border-brand-800/30',
  spotlight:
    'bg-white border-neutral-200 overflow-hidden dark:bg-neutral-900 dark:border-neutral-800',
  interactive:
    'bg-white border-neutral-200 cursor-pointer dark:bg-neutral-900 dark:border-neutral-800',
};

const hoverClasses: Record<CardVariant, string> = {
  default: 'hover:shadow-md hover:border-neutral-300 dark:hover:border-neutral-700',
  ai: 'hover:shadow-lg hover:shadow-violet-500/5 hover:border-violet-300',
  insight: 'hover:shadow-lg hover:shadow-amber-500/5 hover:border-amber-300',
  glass: 'hover:bg-white/70 hover:shadow-lg dark:hover:bg-neutral-900/70',
  gradient: 'hover:shadow-lg hover:shadow-brand-500/5',
  spotlight: 'hover:shadow-lg hover:border-neutral-300 dark:hover:border-neutral-700',
  interactive: 'hover:shadow-md hover:border-brand-300 dark:hover:border-brand-700',
};

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', hover = true, animated = true, children, ...props }, ref) => {
    const baseClasses = cn(
      'rounded-xl border shadow-sm transition-all duration-200',
      variantClasses[variant],
      hover && hoverClasses[variant],
      className
    );

    if (animated && hover) {
      return (
        <motion.div
          ref={ref}
          className={baseClasses}
          whileHover={{ y: -1 }}
          transition={spring.gentle}
          {...(props as HTMLMotionProps<'div'>)}
        >
          {children}
        </motion.div>
      );
    }

    return (
      <div ref={ref} className={baseClasses} {...props}>
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-lg font-semibold leading-none tracking-tight text-neutral-900 dark:text-neutral-50',
      className
    )}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-neutral-500 dark:text-neutral-400', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
