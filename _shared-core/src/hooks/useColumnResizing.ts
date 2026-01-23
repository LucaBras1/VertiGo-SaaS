/**
 * useColumnResizing Hook
 *
 * Manages column widths with drag-to-resize functionality.
 * Persists widths to localStorage for consistent UX.
 */

import { useState, useEffect, useCallback, useRef } from 'react'

interface ColumnWidth {
  id: string
  width: number
}

interface UseColumnResizingOptions {
  /** Unique key for localStorage persistence */
  storageKey: string
  /** Default widths for columns */
  defaultWidths: Record<string, number>
  /** Minimum column width in pixels */
  minWidth?: number
  /** Maximum column width in pixels */
  maxWidth?: number
}

interface UseColumnResizingReturn {
  /** Current column widths */
  columnWidths: Record<string, number>
  /** Get width for a specific column */
  getColumnWidth: (columnId: string) => number
  /** Start resizing a column (call on mousedown) */
  startResize: (columnId: string, startX: number) => void
  /** Handle resize movement (call on mousemove) */
  handleResize: (currentX: number) => void
  /** End resizing (call on mouseup) */
  endResize: () => void
  /** Reset all widths to defaults */
  resetWidths: () => void
  /** Whether currently resizing */
  isResizing: boolean
  /** ID of column being resized */
  resizingColumnId: string | null
}

export function useColumnResizing({
  storageKey,
  defaultWidths,
  minWidth = 80,
  maxWidth = 600,
}: UseColumnResizingOptions): UseColumnResizingReturn {
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(defaultWidths)
  const [isResizing, setIsResizing] = useState(false)
  const [resizingColumnId, setResizingColumnId] = useState<string | null>(null)

  const startXRef = useRef<number>(0)
  const startWidthRef = useRef<number>(0)

  // Load widths from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`column-widths-${storageKey}`)
      if (saved) {
        const parsed = JSON.parse(saved)
        // Merge with defaults (in case new columns were added)
        setColumnWidths({ ...defaultWidths, ...parsed })
      }
    } catch (error) {
      console.warn('Failed to load column widths from localStorage:', error)
    }
  }, [storageKey, defaultWidths])

  // Save widths to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem(`column-widths-${storageKey}`, JSON.stringify(columnWidths))
    } catch (error) {
      console.warn('Failed to save column widths to localStorage:', error)
    }
  }, [storageKey, columnWidths])

  // Get width for a specific column
  const getColumnWidth = useCallback(
    (columnId: string): number => {
      return columnWidths[columnId] ?? defaultWidths[columnId] ?? 150
    },
    [columnWidths, defaultWidths]
  )

  // Start resizing a column
  const startResize = useCallback(
    (columnId: string, startX: number) => {
      setIsResizing(true)
      setResizingColumnId(columnId)
      startXRef.current = startX
      startWidthRef.current = getColumnWidth(columnId)

      // Add cursor style to body during resize
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    },
    [getColumnWidth]
  )

  // Handle resize movement
  const handleResize = useCallback(
    (currentX: number) => {
      if (!isResizing || !resizingColumnId) return

      const delta = currentX - startXRef.current
      const newWidth = Math.min(maxWidth, Math.max(minWidth, startWidthRef.current + delta))

      setColumnWidths((prev) => ({
        ...prev,
        [resizingColumnId]: newWidth,
      }))
    },
    [isResizing, resizingColumnId, minWidth, maxWidth]
  )

  // End resizing
  const endResize = useCallback(() => {
    setIsResizing(false)
    setResizingColumnId(null)

    // Reset cursor style
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }, [])

  // Reset all widths to defaults
  const resetWidths = useCallback(() => {
    setColumnWidths(defaultWidths)
  }, [defaultWidths])

  // Add global mouse event listeners during resize
  useEffect(() => {
    if (!isResizing) return

    const handleMouseMove = (e: MouseEvent) => {
      handleResize(e.clientX)
    }

    const handleMouseUp = () => {
      endResize()
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing, handleResize, endResize])

  return {
    columnWidths,
    getColumnWidth,
    startResize,
    handleResize,
    endResize,
    resetWidths,
    isResizing,
    resizingColumnId,
  }
}
