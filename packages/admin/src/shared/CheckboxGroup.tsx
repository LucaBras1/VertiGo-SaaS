'use client'

import { cn } from '../utils'

interface CheckboxOption {
  value: string
  label: string
  description?: string
}

interface CheckboxGroupProps {
  options: CheckboxOption[]
  selected: string[]
  onChange: (selected: string[]) => void
  columns?: 2 | 3 | 4
}

export function CheckboxGroup({ options, selected, onChange, columns = 3 }: CheckboxGroupProps) {
  const toggle = (value: string) => {
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value]
    )
  }

  const gridCols = {
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-3',
    4: 'sm:grid-cols-4',
  }

  return (
    <div className={cn('grid grid-cols-1 gap-2', gridCols[columns])}>
      {options.map((option) => {
        const isSelected = selected.includes(option.value)
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => toggle(option.value)}
            className={cn(
              'rounded-lg border p-3 text-left text-sm transition-all',
              isSelected
                ? 'border-brand-500 bg-brand-50 text-brand-700 ring-1 ring-brand-500/20 dark:border-brand-600 dark:bg-brand-950/30 dark:text-brand-300'
                : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800'
            )}
          >
            <div className="font-medium">{option.label}</div>
            {option.description && (
              <div className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">{option.description}</div>
            )}
          </button>
        )
      })}
    </div>
  )
}
