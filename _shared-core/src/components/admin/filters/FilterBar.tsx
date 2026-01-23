'use client'

/**
 * FilterBar Component
 *
 * Base filter bar with URL synchronization
 * Composable with any filter inputs
 */

import { ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface FilterBarProps {
  /** Filter input components */
  children: ReactNode

  /** Additional className */
  className?: string

  /** Title for the filter section */
  title?: string

  /** Callback to clear all filters */
  onClear?: () => void

  /** Whether any filters are active */
  hasFilters?: boolean
}

export function FilterBar({ children, className, title, onClear, hasFilters }: FilterBarProps) {
  return (
    <div className={cn(
      'bg-white rounded-lg border border-gray-200 p-4 mb-6',
      className
    )}>
      <div className="flex items-center justify-between mb-4">
        {title && (
          <h3 className="text-sm font-medium text-gray-900">{title}</h3>
        )}
        {hasFilters && onClear && (
          <button
            onClick={onClear}
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
            Vymazat filtry
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {children}
      </div>
    </div>
  )
}

/**
 * FilterInput - Base wrapper for filter inputs
 */
interface FilterInputProps {
  label: string
  children: ReactNode
  className?: string
}

export function FilterInput({ label, children, className }: FilterInputProps) {
  return (
    <div className={cn('flex flex-col', className)}>
      <label className="text-sm font-medium text-gray-700 mb-1.5">
        {label}
      </label>
      {children}
    </div>
  )
}
