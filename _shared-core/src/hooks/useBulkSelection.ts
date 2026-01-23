/**
 * useBulkSelection Hook
 *
 * Manages bulk selection state for tables/lists
 * Handles select all, individual selection, and bulk actions
 */

import { useState, useCallback, useMemo } from 'react'

interface UseBulkSelectionOptions<T> {
  /** All items in the list */
  items: T[]

  /** Function to get unique ID from item */
  getId: (item: T) => string

  /** Initially selected IDs */
  initialSelected?: string[]
}

export interface UseBulkSelectionReturn {
  /** Currently selected IDs */
  selectedIds: string[]

  /** Number of selected items */
  selectedCount: number

  /** Are all items selected? */
  isAllSelected: boolean

  /** Are some (but not all) items selected? */
  isIndeterminate: boolean

  /** Is specific item selected? */
  isSelected: (id: string) => boolean

  /** Toggle selection of specific item */
  toggleItem: (id: string) => void

  /** Toggle all items */
  toggleAll: () => void

  /** Select specific items */
  selectItems: (ids: string[]) => void

  /** Clear all selection */
  clearSelection: () => void

  /** Select all items */
  selectAll: () => void
}

export function useBulkSelection<T>({
  items,
  getId,
  initialSelected = []
}: UseBulkSelectionOptions<T>): UseBulkSelectionReturn {
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelected)

  // All available IDs
  const allIds = useMemo(() => items.map(getId), [items, getId])

  // Selection stats
  const selectedCount = selectedIds.length
  const isAllSelected = allIds.length > 0 && selectedIds.length === allIds.length
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < allIds.length

  // Check if item is selected
  const isSelected = useCallback(
    (id: string) => selectedIds.includes(id),
    [selectedIds]
  )

  // Toggle single item
  const toggleItem = useCallback((id: string) => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    )
  }, [])

  // Toggle all items
  const toggleAll = useCallback(() => {
    setSelectedIds(prev =>
      prev.length === allIds.length ? [] : allIds
    )
  }, [allIds])

  // Select specific items
  const selectItems = useCallback((ids: string[]) => {
    setSelectedIds(ids)
  }, [])

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedIds([])
  }, [])

  // Select all
  const selectAll = useCallback(() => {
    setSelectedIds(allIds)
  }, [allIds])

  return {
    selectedIds,
    selectedCount,
    isAllSelected,
    isIndeterminate,
    isSelected,
    toggleItem,
    toggleAll,
    selectItems,
    clearSelection,
    selectAll
  }
}
