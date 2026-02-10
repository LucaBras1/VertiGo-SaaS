'use client';

import * as React from 'react';
import { cn } from '../utils';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const textareaId = id || React.useId();

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
          >
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'flex min-h-[100px] w-full rounded-lg border bg-white px-3 py-2 text-sm text-neutral-900 transition-all duration-200',
            'placeholder:text-neutral-400',
            'focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500',
            'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-neutral-50',
            'dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-600',
            error
              ? 'border-error-500 focus:ring-error-500/20 focus:border-error-500'
              : 'border-neutral-200 dark:border-neutral-800',
            className
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${textareaId}-error` : undefined}
          {...props}
        />

        {error && (
          <p
            id={`${textareaId}-error`}
            className="mt-1.5 text-xs text-error-600 dark:text-error-400"
            role="alert"
          >
            {error}
          </p>
        )}
        {hint && !error && (
          <p className="mt-1.5 text-xs text-neutral-500 dark:text-neutral-400">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea };
