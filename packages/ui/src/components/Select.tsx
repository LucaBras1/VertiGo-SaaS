'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../utils';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options?: SelectOption[];
  placeholder?: string;
  error?: string;
  label?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, placeholder, error, label, id, children, ...props }, ref) => {
    const selectId = id || React.useId();

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
          >
            {label}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              'flex h-9 w-full appearance-none rounded-lg border bg-white px-3 py-2 pr-10 text-sm text-neutral-900 transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500',
              'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-neutral-50',
              'dark:bg-neutral-950 dark:text-neutral-100',
              error
                ? 'border-error-500 focus:ring-error-500/20 focus:border-error-500'
                : 'border-neutral-200 dark:border-neutral-800',
              className
            )}
            aria-invalid={error ? 'true' : 'false'}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options
              ? options.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                  >
                    {option.label}
                  </option>
                ))
              : children}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500 pointer-events-none dark:text-neutral-400" />
        </div>

        {error && (
          <p
            className="mt-1.5 text-xs text-error-600 dark:text-error-400"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select };
export type { SelectOption as SelectOptionType };
