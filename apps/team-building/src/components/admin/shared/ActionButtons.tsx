'use client'

import { Edit2, Trash2, Eye, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ActionButtonsProps {
  onEdit?: () => void
  onDelete?: () => void
  onView?: () => void
  editHref?: string
  viewHref?: string
  className?: string
}

export function ActionButtons({ onEdit, onDelete, onView, editHref, viewHref, className }: ActionButtonsProps) {
  const buttonBase = 'inline-flex h-9 w-9 sm:h-8 sm:w-8 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300'

  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {(onView || viewHref) && (
        viewHref ? (
          <a href={viewHref} className={cn(buttonBase, 'hover:bg-neutral-100 dark:hover:bg-neutral-800')}>
            <Eye className="h-4 w-4" />
          </a>
        ) : (
          <button onClick={onView} className={cn(buttonBase, 'hover:bg-neutral-100 dark:hover:bg-neutral-800')}>
            <Eye className="h-4 w-4" />
          </button>
        )
      )}
      {(onEdit || editHref) && (
        editHref ? (
          <a href={editHref} className={cn(buttonBase, 'hover:bg-neutral-100 dark:hover:bg-neutral-800')}>
            <Edit2 className="h-4 w-4" />
          </a>
        ) : (
          <button onClick={onEdit} className={cn(buttonBase, 'hover:bg-neutral-100 dark:hover:bg-neutral-800')}>
            <Edit2 className="h-4 w-4" />
          </button>
        )
      )}
      {onDelete && (
        <button
          onClick={onDelete}
          className={cn(buttonBase, 'hover:bg-error-50 hover:text-error-600 dark:hover:bg-error-950/50 dark:hover:text-error-400')}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
