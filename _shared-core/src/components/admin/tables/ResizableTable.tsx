'use client'

/**
 * ResizableTable Component
 *
 * Wrapper component for admin tables with:
 * - Resizable columns (drag to resize)
 * - Sticky header
 * - Sticky first column (checkbox)
 * - Scroll shadows
 * - Optimized scrolling
 */

import { ReactNode, useRef, useState, useEffect } from 'react'
import { useColumnResizing } from '@/hooks/useColumnResizing'
import { cn } from '@/lib/utils'

export interface ColumnDefinition {
  id: string
  label: string
  defaultWidth?: number
  minWidth?: number
  maxWidth?: number
  /** Whether this column can be resized */
  resizable?: boolean
  /** Whether this column should be sticky (first columns) */
  sticky?: boolean
}

interface ResizableTableProps {
  /** Unique identifier for storing column widths */
  storageKey: string
  /** Column definitions */
  columns: ColumnDefinition[]
  /** Table header content (rendered inside thead) */
  headerContent: (props: {
    columns: ColumnDefinition[]
    getColumnWidth: (id: string) => number
    startResize: (id: string, x: number) => void
    isResizing: boolean
    resizingColumnId: string | null
  }) => ReactNode
  /** Table body content */
  children: ReactNode
  /** Maximum height of table container */
  maxHeight?: string
  /** Additional className for table container */
  className?: string
  /** Show row count */
  rowCount?: number
}

export function ResizableTable({
  storageKey,
  columns,
  headerContent,
  children,
  maxHeight = 'calc(100vh - 350px)',
  className,
  rowCount,
}: ResizableTableProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollState, setScrollState] = useState({
    left: false,
    right: false,
  })

  // Build default widths from column definitions
  const defaultWidths = columns.reduce(
    (acc, col) => ({
      ...acc,
      [col.id]: col.defaultWidth ?? 150,
    }),
    {} as Record<string, number>
  )

  const {
    getColumnWidth,
    startResize,
    isResizing,
    resizingColumnId,
  } = useColumnResizing({
    storageKey: `admin-${storageKey}`,
    defaultWidths,
    minWidth: 80,
    maxWidth: 600,
  })

  // Update scroll shadow state
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const updateScrollState = () => {
      const { scrollLeft, scrollWidth, clientWidth } = container
      setScrollState({
        left: scrollLeft > 0,
        right: scrollLeft < scrollWidth - clientWidth - 1,
      })
    }

    updateScrollState()
    container.addEventListener('scroll', updateScrollState)

    // Also update on resize
    const resizeObserver = new ResizeObserver(updateScrollState)
    resizeObserver.observe(container)

    return () => {
      container.removeEventListener('scroll', updateScrollState)
      resizeObserver.disconnect()
    }
  }, [])

  return (
    <div className={cn('relative', className)}>
      {/* Scroll shadow indicators */}
      {scrollState.left && (
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-gray-200/80 to-transparent pointer-events-none z-20" />
      )}
      {scrollState.right && (
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-200/80 to-transparent pointer-events-none z-20" />
      )}

      {/* Table container with scroll */}
      <div
        ref={containerRef}
        className="overflow-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
        style={{ maxHeight }}
      >
        <table className="min-w-full divide-y divide-gray-200 table-fixed">
          <thead className="bg-gray-50 sticky top-0 z-10">
            {headerContent({
              columns,
              getColumnWidth,
              startResize,
              isResizing,
              resizingColumnId,
            })}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 [&>tr:nth-child(even)]:bg-gray-50 [&>tr:hover]:bg-blue-50 [&>tr]:transition-colors">
            {children}
          </tbody>
        </table>
      </div>

      {/* Row count footer */}
      {rowCount !== undefined && (
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
          Celkem: {rowCount} zaznam{rowCount === 1 ? '' : rowCount < 5 ? 'y' : 'u'}
        </div>
      )}
    </div>
  )
}

/**
 * ResizableTableHeader Component
 *
 * Single header cell with resize handle
 */
interface ResizableTableHeaderProps {
  column: ColumnDefinition
  width: number
  onStartResize: (x: number) => void
  isResizing: boolean
  isThisResizing: boolean
  children: ReactNode
  className?: string
  sticky?: boolean
  stickyOffset?: number
}

export function ResizableTableHeader({
  column,
  width,
  onStartResize,
  isResizing,
  isThisResizing,
  children,
  className,
  sticky = false,
  stickyOffset = 0,
}: ResizableTableHeaderProps) {
  const resizable = column.resizable !== false

  return (
    <th
      className={cn(
        'px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider relative select-none',
        sticky && 'sticky z-20 bg-gray-50',
        isThisResizing && 'bg-blue-50',
        className
      )}
      style={{
        width: `${width}px`,
        minWidth: `${column.minWidth ?? 80}px`,
        maxWidth: column.maxWidth ? `${column.maxWidth}px` : undefined,
        left: sticky ? `${stickyOffset}px` : undefined,
      }}
    >
      {children}

      {/* Resize handle */}
      {resizable && (
        <div
          className={cn(
            'absolute right-0 top-0 bottom-0 w-1 cursor-col-resize group',
            'hover:bg-blue-400 active:bg-blue-500',
            isThisResizing && 'bg-blue-500'
          )}
          onMouseDown={(e) => {
            e.preventDefault()
            onStartResize(e.clientX)
          }}
        >
          {/* Visual indicator on hover */}
          <div
            className={cn(
              'absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-gray-300 rounded',
              'group-hover:bg-blue-400 group-hover:h-6',
              isThisResizing && 'bg-blue-500 h-6'
            )}
          />
        </div>
      )}
    </th>
  )
}
