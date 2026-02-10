'use client'

import { clsx } from 'clsx'
import {
  Check, X, Star, RotateCcw, Square, CheckSquare, Grid3X3, Grid2X2, LayoutGrid
} from 'lucide-react'
import type { FilterMode, GridSize } from '@/hooks/usePhotoSelection'
import { Button } from '@vertigo/ui'

interface PhotoSelectionToolbarProps {
  stats: {
    total: number
    selected: number
    rejected: number
    highlights: number
    checked: number
  }
  filterMode: FilterMode
  gridSize: GridSize
  isUpdating: boolean
  onFilterChange: (filter: FilterMode) => void
  onGridSizeChange: (size: GridSize) => void
  onSelectAll: () => void
  onClearSelection: () => void
  onBulkSelect: () => void
  onBulkReject: () => void
  onBulkHighlight: () => void
  onBulkReset: () => void
}

export function PhotoSelectionToolbar({
  stats,
  filterMode,
  gridSize,
  isUpdating,
  onFilterChange,
  onGridSizeChange,
  onSelectAll,
  onClearSelection,
  onBulkSelect,
  onBulkReject,
  onBulkHighlight,
  onBulkReset
}: PhotoSelectionToolbarProps) {
  const filterOptions: { value: FilterMode; label: string; count: number }[] = [
    { value: 'all', label: 'All', count: stats.total },
    { value: 'selected', label: 'Selected', count: stats.selected },
    { value: 'rejected', label: 'Rejected', count: stats.rejected },
    { value: 'highlights', label: 'Highlights', count: stats.highlights }
  ]

  const gridOptions: { value: GridSize; icon: typeof Grid3X3; label: string }[] = [
    { value: 'small', icon: Grid3X3, label: 'Small' },
    { value: 'medium', icon: Grid2X2, label: 'Medium' },
    { value: 'large', icon: LayoutGrid, label: 'Large' }
  ]

  return (
    <div className="space-y-3 pb-4 border-b border-gray-200">
      {/* Top Row: Selection & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Selection Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={stats.checked > 0 ? onClearSelection : onSelectAll}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {stats.checked > 0 ? (
              <>
                <CheckSquare className="w-4 h-4" />
                Clear ({stats.checked})
              </>
            ) : (
              <>
                <Square className="w-4 h-4" />
                Select All
              </>
            )}
          </button>

          {stats.checked > 0 && (
            <span className="text-sm text-gray-500">
              {stats.checked} of {stats.total} checked
            </span>
          )}

          {isUpdating && (
            <span className="text-sm text-amber-600 flex items-center gap-1">
              <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-amber-500" />
              Saving...
            </span>
          )}
        </div>

        {/* Filter & Grid Controls */}
        <div className="flex items-center gap-4">
          {/* Filter Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Filter:</span>
            <select
              value={filterMode}
              onChange={(e) => onFilterChange(e.target.value as FilterMode)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {filterOptions.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label} ({opt.count})
                </option>
              ))}
            </select>
          </div>

          {/* Grid Size Toggle */}
          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
            {gridOptions.map(opt => {
              const Icon = opt.icon
              return (
                <button
                  key={opt.value}
                  onClick={() => onGridSizeChange(opt.value)}
                  className={clsx(
                    'p-2 transition-colors',
                    gridSize === opt.value
                      ? 'bg-amber-500 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  )}
                  title={`${opt.label} Grid`}
                >
                  <Icon className="w-4 h-4" />
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Bottom Row: Bulk Actions (visible when photos are checked) */}
      {stats.checked > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <span className="text-sm text-gray-600 mr-2">Actions:</span>

          <Button
            size="sm"
            variant="outline"
            onClick={onBulkSelect}
            className="text-green-600 border-green-300 hover:bg-green-50"
          >
            <Check className="w-4 h-4 mr-1" />
            Select
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={onBulkReject}
            className="text-red-600 border-red-300 hover:bg-red-50"
          >
            <X className="w-4 h-4 mr-1" />
            Reject
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={onBulkHighlight}
            className="text-amber-600 border-amber-300 hover:bg-amber-50"
          >
            <Star className="w-4 h-4 mr-1" />
            Highlight
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={onBulkReset}
            className="text-gray-600 border-gray-300 hover:bg-gray-50"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </Button>
        </div>
      )}
    </div>
  )
}
