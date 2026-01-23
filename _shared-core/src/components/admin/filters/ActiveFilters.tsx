'use client'

/**
 * ActiveFilters Component
 *
 * Displays active filters as removable tags
 * Shows "Clear all" button when filters are active
 */

import { X } from 'lucide-react'
import { useUrlFilters, type Filters } from '@/hooks/useUrlFilters'
import { cn } from '@/lib/utils'

/**
 * Filter item for explicit filters prop
 */
interface FilterItem {
  key: string
  label: string
  values: string[]
  onClear: () => void
}

export interface ActiveFiltersProps {
  /** Labels for filter keys (key -> human readable label) */
  filterLabels?: Record<string, string>

  /** Value formatters (key -> format function) */
  valueFormatters?: Record<string, (value: any) => string>

  /** Additional className */
  className?: string

  /** Explicit filters to display (alternative to using URL filters) */
  filters?: FilterItem[]

  /** Callback to clear all filters */
  onClearAll?: () => void
}

/**
 * Default value formatter - converts value to string
 */
function defaultFormatter(value: any): string {
  if (Array.isArray(value)) {
    return value.join(', ')
  }
  if (typeof value === 'boolean') {
    return value ? 'Ano' : 'Ne'
  }
  return String(value)
}

export function ActiveFilters({
  filterLabels = {},
  valueFormatters = {},
  className,
  filters: explicitFilters,
  onClearAll
}: ActiveFiltersProps) {
  const urlFilters = useUrlFilters()

  // If explicit filters are provided, use those
  if (explicitFilters !== undefined) {
    const activeFilters = explicitFilters.filter(f => f.values && f.values.length > 0)

    if (activeFilters.length === 0) {
      return null
    }

    return (
      <div className={cn('mb-6', className)}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-700">Aktivní filtry:</h3>
          {onClearAll && (
            <button
              onClick={onClearAll}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Vymazat vše
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {activeFilters.map((filter) => (
            <button
              key={filter.key}
              onClick={filter.onClear}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 text-sm rounded-md hover:bg-blue-100 transition-colors"
            >
              <span>
                <span className="font-medium">{filter.label}:</span> {filter.values.join(', ')}
              </span>
              <X className="h-3.5 w-3.5" />
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Otherwise, use URL filters (original behavior)
  if (!urlFilters.hasFilters) {
    return null
  }

  return (
    <div className={cn('mb-6', className)}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-700">Aktivní filtry:</h3>
        <button
          onClick={urlFilters.clearAllFilters}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Vymazat vše
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {Object.entries(urlFilters.filters).map(([key, value]) => {
          const label = filterLabels[key] || key
          const formatter = valueFormatters[key] || defaultFormatter
          const displayValue = formatter(value)

          return (
            <button
              key={key}
              onClick={() => urlFilters.clearFilter(key)}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 text-sm rounded-md hover:bg-blue-100 transition-colors"
            >
              <span>
                <span className="font-medium">{label}:</span> {displayValue}
              </span>
              <X className="h-3.5 w-3.5" />
            </button>
          )
        })}
      </div>
    </div>
  )
}
