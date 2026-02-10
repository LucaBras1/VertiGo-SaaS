import { SelectHTMLAttributes, forwardRef } from 'react'
import { cn } from '../utils'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          'w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition-all',
          'focus:ring-2 focus:ring-brand-500/20',
          'dark:bg-neutral-900 dark:text-neutral-100',
          error
            ? 'border-error-300 focus:border-error-500 dark:border-error-700'
            : 'border-neutral-200 focus:border-brand-500 dark:border-neutral-700',
          className
        )}
        {...props}
      >
        {children}
      </select>
    )
  }
)
Select.displayName = 'Select'
