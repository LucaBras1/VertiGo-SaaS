/**
 * useColumnVisibility Hook
 *
 * Manages column visibility state with localStorage persistence
 */

import { useState, useCallback, useEffect } from 'react'

export interface ColumnDefinition<T> {
  /** Unique column identifier */
  id: string
  /** Display label */
  label: string
  /** Whether column is visible by default */
  defaultVisible?: boolean
  /** Whether column can be hidden */
  canHide?: boolean
  /** Column width class */
  width?: string
  /** Render function for cell content */
  render?: (item: T) => React.ReactNode
  /** Key for accessing data (for simple cases) */
  accessor?: keyof T
  /** Export format function */
  exportFormat?: (item: T) => string
}

export interface UseColumnVisibilityOptions<T> {
  /** Column definitions */
  columns: ColumnDefinition<T>[]
  /** Storage key for localStorage */
  storageKey: string
}

export interface UseColumnVisibilityReturn<T> {
  /** All column definitions */
  columns: ColumnDefinition<T>[]
  /** Currently visible columns */
  visibleColumns: ColumnDefinition<T>[]
  /** Visibility state for each column */
  columnVisibility: Record<string, boolean>
  /** Toggle column visibility */
  toggleColumn: (columnId: string) => void
  /** Set visibility for a column */
  setColumnVisibility: (columnId: string, visible: boolean) => void
  /** Reset to default visibility */
  resetToDefaults: () => void
  /** Show all columns */
  showAll: () => void
  /** Hide all optional columns */
  hideAll: () => void
  /** Check if column is visible */
  isVisible: (columnId: string) => boolean
}

export function useColumnVisibility<T>({
  columns,
  storageKey,
}: UseColumnVisibilityOptions<T>): UseColumnVisibilityReturn<T> {
  // Initialize with defaults to avoid hydration mismatch
  const [columnVisibility, setColumnVisibilityState] = useState<Record<string, boolean>>(() => {
    return getDefaultVisibility(columns)
  })

  // Track if we've loaded from localStorage (to avoid overwriting on first render)
  const [hasLoadedFromStorage, setHasLoadedFromStorage] = useState(false)

  // Load from localStorage after mount (client-side only)
  useEffect(() => {
    if (hasLoadedFromStorage) return

    try {
      const stored = localStorage.getItem(`columns:${storageKey}`)
      if (stored) {
        const parsed = JSON.parse(stored)
        // Merge with defaults to handle new columns
        const defaults = getDefaultVisibility(columns)
        setColumnVisibilityState({ ...defaults, ...parsed })
      }
    } catch {
      // Ignore localStorage errors
    }
    setHasLoadedFromStorage(true)
  }, [columns, storageKey, hasLoadedFromStorage])

  // Persist to localStorage (skip initial render)
  useEffect(() => {
    if (!hasLoadedFromStorage) return

    try {
      localStorage.setItem(`columns:${storageKey}`, JSON.stringify(columnVisibility))
    } catch {
      // Ignore localStorage errors
    }
  }, [columnVisibility, storageKey, hasLoadedFromStorage])

  const toggleColumn = useCallback((columnId: string) => {
    setColumnVisibilityState((prev) => ({
      ...prev,
      [columnId]: !prev[columnId],
    }))
  }, [])

  const setColumnVisibility = useCallback((columnId: string, visible: boolean) => {
    setColumnVisibilityState((prev) => ({
      ...prev,
      [columnId]: visible,
    }))
  }, [])

  const resetToDefaults = useCallback(() => {
    setColumnVisibilityState(getDefaultVisibility(columns))
  }, [columns])

  const showAll = useCallback(() => {
    const allVisible: Record<string, boolean> = {}
    columns.forEach((col) => {
      allVisible[col.id] = true
    })
    setColumnVisibilityState(allVisible)
  }, [columns])

  const hideAll = useCallback(() => {
    const visibility: Record<string, boolean> = {}
    columns.forEach((col) => {
      // Keep columns that can't be hidden
      visibility[col.id] = col.canHide === false
    })
    setColumnVisibilityState(visibility)
  }, [columns])

  const isVisible = useCallback(
    (columnId: string) => {
      return columnVisibility[columnId] ?? true
    },
    [columnVisibility]
  )

  const visibleColumns = columns.filter((col) => columnVisibility[col.id] !== false)

  return {
    columns,
    visibleColumns,
    columnVisibility,
    toggleColumn,
    setColumnVisibility,
    resetToDefaults,
    showAll,
    hideAll,
    isVisible,
  }
}

function getDefaultVisibility<T>(columns: ColumnDefinition<T>[]): Record<string, boolean> {
  const visibility: Record<string, boolean> = {}
  columns.forEach((col) => {
    visibility[col.id] = col.defaultVisible !== false
  })
  return visibility
}
