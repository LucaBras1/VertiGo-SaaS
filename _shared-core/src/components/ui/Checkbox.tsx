'use client'

/**
 * Checkbox Component
 *
 * Accessible checkbox using Headless UI
 */

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { Check, Minus } from 'lucide-react'

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Indeterminate state (for "select all" checkboxes) */
  indeterminate?: boolean

  /** Additional className */
  className?: string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, indeterminate = false, checked, ...props }, ref) => {
    return (
      <div className="relative inline-flex">
        <input
          type="checkbox"
          ref={ref}
          checked={checked}
          {...props}
          className={cn(
            'peer h-5 w-5 shrink-0 rounded border-2 border-gray-300 bg-white',
            'hover:border-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'checked:bg-blue-600 checked:border-blue-600',
            'cursor-pointer',
            className
          )}
        />
        {/* Check icon overlay */}
        {checked && !indeterminate && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <Check className="h-4 w-4 text-white" strokeWidth={3} />
          </div>
        )}
        {/* Indeterminate icon overlay */}
        {indeterminate && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <Minus className="h-4 w-4 text-white" strokeWidth={3} />
          </div>
        )}
      </div>
    )
  }
)

Checkbox.displayName = 'Checkbox'
