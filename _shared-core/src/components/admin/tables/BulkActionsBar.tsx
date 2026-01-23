'use client'

/**
 * BulkActionsBar Component
 *
 * Toolbar for bulk actions when items are selected
 * Appears at top of table/list with action buttons
 */

import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { X, Trash2, Download, ChevronDown, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface BulkAction {
  id: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
  onClick: () => void | Promise<void>
  variant?: 'default' | 'danger'
  disabled?: boolean
}

interface BulkActionsBarProps {
  /** Number of selected items */
  selectedCount: number

  /** Clear selection callback */
  onClearSelection: () => void

  /** Primary actions (displayed as buttons) */
  primaryActions?: BulkAction[]

  /** Secondary actions (displayed in dropdown menu) */
  secondaryActions?: BulkAction[]

  /** Additional className */
  className?: string
}

export function BulkActionsBar({
  selectedCount,
  onClearSelection,
  primaryActions = [],
  secondaryActions = [],
  className
}: BulkActionsBarProps) {
  if (selectedCount === 0) {
    return null
  }

  return (
    <div className={cn(
      'sticky top-0 z-10 bg-blue-50 border-b border-blue-200 px-4 py-3 mb-4 rounded-t-lg',
      'flex items-center justify-between gap-4',
      className
    )}>
      {/* Selection info */}
      <div className="flex items-center gap-3">
        <CheckCircle className="h-5 w-5 text-blue-600" />
        <span className="text-sm font-medium text-blue-900">
          {selectedCount} {selectedCount === 1 ? 'položka vybrána' : selectedCount < 5 ? 'položky vybrány' : 'položek vybráno'}
        </span>
        <button
          onClick={onClearSelection}
          className="text-sm text-blue-700 hover:text-blue-900 font-medium flex items-center gap-1"
        >
          <X className="h-4 w-4" />
          Zrušit výběr
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Primary actions */}
        {primaryActions.map((action) => {
          const Icon = action.icon

          return (
            <button
              key={action.id}
              onClick={action.onClick}
              disabled={action.disabled}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md',
                'transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
                action.variant === 'danger'
                  ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-red-300'
                  : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-blue-300',
                action.disabled && 'cursor-not-allowed opacity-50'
              )}
            >
              {Icon && <Icon className="h-4 w-4" />}
              {action.label}
            </button>
          )
        })}

        {/* Secondary actions dropdown */}
        {secondaryActions.length > 0 && (
          <Menu as="div" className="relative">
            <Menu.Button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Další akce
              <ChevronDown className="h-4 w-4" />
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
              <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="px-1 py-1">
                  {secondaryActions.map((action) => {
                    const Icon = action.icon

                    return (
                      <Menu.Item key={action.id} disabled={action.disabled}>
                        {({ active }) => (
                          <button
                            onClick={action.onClick}
                            disabled={action.disabled}
                            className={cn(
                              'group flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm',
                              active && !action.disabled ? 'bg-blue-50 text-blue-900' : 'text-gray-900',
                              action.variant === 'danger' && 'text-red-600',
                              action.disabled && 'opacity-50 cursor-not-allowed'
                            )}
                          >
                            {Icon && <Icon className="h-4 w-4" />}
                            {action.label}
                          </button>
                        )}
                      </Menu.Item>
                    )
                  })}
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        )}
      </div>
    </div>
  )
}
