'use client';

import * as React from 'react';
import { cn } from '../utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  /** Use floating label style */
  floating?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, hint, leftIcon, rightIcon, floating, id, ...props }, ref) => {
    const inputId = id || React.useId();
    const [focused, setFocused] = React.useState(false);
    const [hasValue, setHasValue] = React.useState(!!props.value || !!props.defaultValue);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(false);
      setHasValue(!!e.target.value);
      props.onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(!!e.target.value);
      props.onChange?.(e);
    };

    const isFloating = floating && label;
    const showFloatingLabel = isFloating && (focused || hasValue);

    return (
      <div className="w-full">
        {label && !floating && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">
              {leftIcon}
            </div>
          )}

          <input
            type={type}
            id={inputId}
            className={cn(
              'flex h-9 w-full rounded-lg border bg-white px-3 py-2 text-sm text-neutral-900 transition-all duration-200',
              'placeholder:text-neutral-400',
              'focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500',
              'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-neutral-50',
              'dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-600',
              error
                ? 'border-error-500 focus:ring-error-500/20 focus:border-error-500'
                : 'border-neutral-200 dark:border-neutral-800',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              isFloating && 'pt-5 pb-1',
              className
            )}
            ref={ref}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            {...props}
          />

          {isFloating && (
            <label
              htmlFor={inputId}
              className={cn(
                'pointer-events-none absolute left-3 transition-all duration-200',
                leftIcon && 'left-10',
                showFloatingLabel
                  ? 'top-1 text-xs text-brand-600 dark:text-brand-400'
                  : 'top-1/2 -translate-y-1/2 text-sm text-neutral-400'
              )}
            >
              {label}
            </label>
          )}

          {rightIcon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <p className="mt-1.5 text-xs text-error-600 dark:text-error-400">{error}</p>
        )}
        {hint && !error && (
          <p className="mt-1.5 text-xs text-neutral-500 dark:text-neutral-400">{hint}</p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
