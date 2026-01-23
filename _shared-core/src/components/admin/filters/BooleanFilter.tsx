'use client'

/**
 * BooleanFilter Component
 *
 * Three-state filter: All / Yes / No
 * Used for: has invoice, featured, recommended, etc.
 */

import { cn } from '@/lib/utils'

export interface BooleanFilterProps {
  /** Field label */
  label?: string

  /** Current value (undefined = all, true = yes, false = no) */
  value: boolean | undefined

  /** Callback when value changes */
  onChange: (value: boolean | undefined) => void

  /** Label for "true" option */
  trueLabel?: string

  /** Label for "false" option */
  falseLabel?: string

  /** Label for "all" option */
  allLabel?: string

  /** Additional className */
  className?: string
}

export function BooleanFilter({
  label,
  value,
  onChange,
  trueLabel = 'Ano',
  falseLabel = 'Ne',
  allLabel = 'Vše',
  className,
}: BooleanFilterProps) {
  const options = [
    { value: undefined, label: allLabel },
    { value: true, label: trueLabel },
    { value: false, label: falseLabel },
  ]

  return (
    <div className={cn('flex flex-col', className)}>
      {label && (
        <label className="text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <div className="flex rounded-md border border-gray-300 overflow-hidden">
        {options.map((option, index) => (
          <button
            key={String(option.value)}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              'flex-1 px-3 py-2 text-sm font-medium transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset',
              index > 0 && 'border-l border-gray-300',
              value === option.value
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}
