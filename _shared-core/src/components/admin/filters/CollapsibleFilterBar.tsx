'use client'

/**
 * CollapsibleFilterBar Component
 *
 * A filter bar with basic filters always visible and
 * advanced filters in a collapsible section.
 */

import { ReactNode, useState, useEffect } from 'react'
import { ChevronDown, ChevronUp, X, Filter, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CollapsibleFilterBarProps {
  /** Unique key for localStorage persistence */
  storageKey: string
  /** Basic filters - always visible */
  basicFilters: ReactNode
  /** Advanced filters - in collapsible section */
  advancedFilters: ReactNode
  /** Total number of active filters */
  activeFilterCount: number
  /** Number of active advanced filters */
  activeAdvancedFilterCount?: number
  /** Callback to clear all filters */
  onClear: () => void
  /** Whether any filters are active */
  hasFilters: boolean
  /** Additional className */
  className?: string
}

export function CollapsibleFilterBar({
  storageKey,
  basicFilters,
  advancedFilters,
  activeFilterCount,
  activeAdvancedFilterCount = 0,
  onClear,
  hasFilters,
  className,
}: CollapsibleFilterBarProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Load expanded state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`filter-expanded-${storageKey}`)
      if (saved !== null) {
        setIsExpanded(JSON.parse(saved))
      }
    } catch {
      // Ignore errors
    }
  }, [storageKey])

  // Save expanded state to localStorage
  const toggleExpanded = () => {
    const newState = !isExpanded
    setIsExpanded(newState)
    try {
      localStorage.setItem(`filter-expanded-${storageKey}`, JSON.stringify(newState))
    } catch {
      // Ignore errors
    }
  }

  return (
    <div className={cn('bg-white border border-gray-200 rounded-lg shadow-sm', className)}>
      {/* Basic Filters Section */}
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {basicFilters}
        </div>

        {/* Toggle and Clear Row */}
        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={toggleExpanded}
            className={cn(
              'inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
              'text-gray-700 hover:bg-gray-100',
              isExpanded && 'bg-gray-100'
            )}
          >
            <Filter className="h-4 w-4" />
            <span>
              {isExpanded ? 'Mene filtru' : 'Vice filtru'}
            </span>
            {activeAdvancedFilterCount > 0 && !isExpanded && (
              <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                {activeAdvancedFilterCount}
              </span>
            )}
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          <div className="flex items-center gap-3">
            {/* Active filters count */}
            {activeFilterCount > 0 && (
              <span className="text-sm text-gray-500">
                {activeFilterCount} aktivni{activeFilterCount === 1 ? '' : 'ch'} filtr{activeFilterCount === 1 ? '' : 'u'}
              </span>
            )}

            {/* Clear button */}
            {hasFilters && (
              <button
                type="button"
                onClick={onClear}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                Vymazat filtry
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Advanced Filters Section - Collapsible */}
      <div
        className={cn(
          'overflow-hidden transition-all duration-300 ease-in-out',
          isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="px-4 pb-4 pt-2 border-t border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {advancedFilters}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * FilterSection Component
 *
 * Helper component for grouping related filters
 */
interface FilterSectionProps {
  title?: string
  children: ReactNode
  className?: string
}

export function FilterSection({ title, children, className }: FilterSectionProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {title && (
        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
          {title}
        </h4>
      )}
      {children}
    </div>
  )
}

/**
 * ActiveFilters Component
 *
 * Displays active filters as removable chips
 */
interface ActiveFilter {
  id: string
  label: string
  value: string
}

interface ActiveFiltersProps {
  filters: ActiveFilter[]
  onRemove: (id: string) => void
  onClearAll?: () => void
  className?: string
}

export function ActiveFilters({
  filters,
  onRemove,
  onClearAll,
  className,
}: ActiveFiltersProps) {
  if (filters.length === 0) return null

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <span className="text-xs text-gray-500 font-medium">Aktivni filtry:</span>
      {filters.map((filter) => (
        <span
          key={filter.id}
          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
        >
          <span className="text-blue-600">{filter.label}:</span>
          <span>{filter.value}</span>
          <button
            type="button"
            onClick={() => onRemove(filter.id)}
            className="ml-1 hover:text-blue-600 transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      {onClearAll && filters.length > 1 && (
        <button
          type="button"
          onClick={onClearAll}
          className="text-xs text-gray-500 hover:text-gray-700 underline"
        >
          Vymazat vse
        </button>
      )}
    </div>
  )
}
