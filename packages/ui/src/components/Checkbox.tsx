'use client';

import * as React from 'react';
import { cn } from '../utils';

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
  indeterminate?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      className,
      label,
      description,
      id,
      indeterminate,
      onCheckedChange,
      onChange,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const internalRef = React.useRef<HTMLInputElement>(null);

    React.useImperativeHandle(ref, () => internalRef.current!);

    React.useEffect(() => {
      if (internalRef.current) {
        internalRef.current.indeterminate = indeterminate || false;
      }
    }, [indeterminate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
      onCheckedChange?.(e.target.checked);
    };

    return (
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            ref={internalRef}
            id={inputId}
            type="checkbox"
            className={cn(
              'h-4 w-4 rounded border-neutral-300',
              'text-brand-600 focus:ring-brand-500',
              'transition-colors duration-200',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'dark:border-neutral-600 dark:bg-neutral-800',
              className
            )}
            onChange={handleChange}
            {...props}
          />
        </div>
        {(label || description) && (
          <div className="ml-3 text-sm">
            {label && (
              <label
                htmlFor={inputId}
                className="font-medium text-neutral-700 cursor-pointer dark:text-neutral-300"
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-neutral-500 dark:text-neutral-400">
                {description}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export { Checkbox };
