'use client'

import * as React from 'react'
import { cn } from '../../utils'

export type BillingInterval = 'month' | 'year'

export interface PricingToggleProps {
  value: BillingInterval
  onChange: (interval: BillingInterval) => void
  className?: string
  yearlySavings?: string // e.g., "Save 17%"
}

/**
 * Toggle switch for monthly/yearly billing interval selection
 *
 * @example
 * const [interval, setInterval] = useState<BillingInterval>('month')
 *
 * <PricingToggle
 *   value={interval}
 *   onChange={setInterval}
 *   yearlySavings="Save 17%"
 * />
 */
export function PricingToggle({
  value,
  onChange,
  className,
  yearlySavings = 'Save 17%',
}: PricingToggleProps) {
  return (
    <div className={cn('flex items-center justify-center gap-4', className)}>
      <span
        className={cn(
          'text-sm font-medium transition-colors',
          value === 'month' ? 'text-foreground' : 'text-muted-foreground'
        )}
      >
        Monthly
      </span>

      <button
        type="button"
        role="switch"
        aria-checked={value === 'year'}
        onClick={() => onChange(value === 'month' ? 'year' : 'month')}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent',
          'transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2',
          'focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          value === 'year' ? 'bg-primary' : 'bg-muted'
        )}
      >
        <span className="sr-only">Toggle billing interval</span>
        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow-lg ring-0',
            'transition duration-200 ease-in-out',
            value === 'year' ? 'translate-x-5' : 'translate-x-0'
          )}
        />
      </button>

      <span
        className={cn(
          'text-sm font-medium transition-colors',
          value === 'year' ? 'text-foreground' : 'text-muted-foreground'
        )}
      >
        Yearly
        {yearlySavings && (
          <span className="ml-1.5 inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
            {yearlySavings}
          </span>
        )}
      </span>
    </div>
  )
}
