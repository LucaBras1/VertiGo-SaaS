import { useState, useCallback, useMemo } from 'react'

export interface UseBulkSelectionOptions<T> {
  items: T[]
  getItemId: (item: T) => string
}

export interface UseBulkSelectionReturn {
  selectedIds: Set<string>
  isSelected: (id: string) => boolean
  toggle: (id: string) => void
  selectAll: () => void
  deselectAll: () => void
  toggleAll: () => void
  isAllSelected: boolean
  isPartiallySelected: boolean
  selectedCount: number
  hasSelection: boolean
}

/**
 * Hook for managing bulk selection of items
 * Used across all list pages for multi-select functionality
 */
export function useBulkSelection<T>({
  items,
  getItemId,
}: UseBulkSelectionOptions<T>): UseBulkSelectionReturn {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const allIds = useMemo(() => {
    return new Set(items.map(getItemId))
  }, [items, getItemId])

  const isSelected = useCallback(
    (id: string) => selectedIds.has(id),
    [selectedIds]
  )

  const toggle = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(allIds))
  }, [allIds])

  const deselectAll = useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  const toggleAll = useCallback(() => {
    if (selectedIds.size === allIds.size) {
      deselectAll()
    } else {
      selectAll()
    }
  }, [selectedIds.size, allIds.size, selectAll, deselectAll])

  const isAllSelected = useMemo(() => {
    return items.length > 0 && selectedIds.size === allIds.size
  }, [items.length, selectedIds.size, allIds.size])

  const isPartiallySelected = useMemo(() => {
    return selectedIds.size > 0 && selectedIds.size < allIds.size
  }, [selectedIds.size, allIds.size])

  const selectedCount = selectedIds.size

  const hasSelection = selectedCount > 0

  return {
    selectedIds,
    isSelected,
    toggle,
    selectAll,
    deselectAll,
    toggleAll,
    isAllSelected,
    isPartiallySelected,
    selectedCount,
    hasSelection,
  }
}
