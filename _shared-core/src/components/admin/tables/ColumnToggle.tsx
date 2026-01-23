'use client'

/**
 * ColumnToggle Component
 *
 * Dropdown menu for toggling column visibility in data tables
 */

import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { Columns3, Check, RotateCcw, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ColumnDefinition } from '@/hooks/useColumnVisibility'

export interface ColumnToggleProps<T> {
  /** All available columns */
  columns: ColumnDefinition<T>[]
  /** Current visibility state */
  columnVisibility: Record<string, boolean>
  /** Toggle column visibility */
  onToggle: (columnId: string) => void
  /** Reset to defaults */
  onReset: () => void
  /** Show all columns */
  onShowAll: () => void
  /** Hide all optional columns */
  onHideAll: () => void
  /** Additional className */
  className?: string
}

export function ColumnToggle<T>({
  columns,
  columnVisibility,
  onToggle,
  onReset,
  onShowAll,
  onHideAll,
  className,
}: ColumnToggleProps<T>) {
  const visibleCount = Object.values(columnVisibility).filter(Boolean).length
  const totalCount = columns.length

  return (
    <Menu as="div" className={cn('relative inline-block text-left', className)}>
      <Menu.Button className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
        <Columns3 className="h-4 w-4" />
        <span className="hidden sm:inline">Sloupce</span>
        <span className="text-xs text-gray-500">
          ({visibleCount}/{totalCount})
        </span>
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-20 mt-2 w-64 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          {/* Quick actions */}
          <div className="px-3 py-2 border-b border-gray-100">
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={onShowAll}
                className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900"
              >
                <Eye className="h-3 w-3" />
                Zobrazit vše
              </button>
              <button
                onClick={onHideAll}
                className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900"
              >
                <EyeOff className="h-3 w-3" />
                Skrýt vše
              </button>
              <button
                onClick={onReset}
                className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900"
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </button>
            </div>
          </div>

          {/* Column list */}
          <div className="py-1 max-h-80 overflow-y-auto">
            {columns.map((column) => {
              const isVisible = columnVisibility[column.id] !== false
              const canHide = column.canHide !== false

              return (
                <Menu.Item key={column.id}>
                  {({ active }) => (
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        if (canHide) {
                          onToggle(column.id)
                        }
                      }}
                      disabled={!canHide}
                      className={cn(
                        'flex w-full items-center gap-3 px-3 py-2 text-sm',
                        active && canHide ? 'bg-gray-50' : '',
                        !canHide && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      <span
                        className={cn(
                          'flex h-4 w-4 items-center justify-center rounded border',
                          isVisible
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'border-gray-300 bg-white'
                        )}
                      >
                        {isVisible && <Check className="h-3 w-3" />}
                      </span>
                      <span className={cn('flex-1 text-left', isVisible ? 'text-gray-900' : 'text-gray-500')}>
                        {column.label}
                      </span>
                      {!canHide && (
                        <span className="text-xs text-gray-400">povinné</span>
                      )}
                    </button>
                  )}
                </Menu.Item>
              )
            })}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}
