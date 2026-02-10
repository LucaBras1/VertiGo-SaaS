'use client'

import { motion } from 'framer-motion'
import { slideUp, Button } from '@vertigo/ui'
import type { LucideIcon } from 'lucide-react'

interface ListPageHeaderProps {
  title: string
  description?: string
  actionLabel?: string
  actionHref?: string
  actionIcon?: LucideIcon
  onAction?: () => void
}

export function ListPageHeader({
  title,
  description,
  actionLabel,
  actionHref,
  actionIcon: ActionIcon,
  onAction,
}: ListPageHeaderProps) {
  return (
    <motion.div
      {...slideUp}
      className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-neutral-500 dark:text-neutral-400">{description}</p>
        )}
      </div>
      {actionLabel && (
        actionHref ? (
          <a href={actionHref}>
            <Button>
              {ActionIcon && <ActionIcon className="h-4 w-4" />}
              {actionLabel}
            </Button>
          </a>
        ) : (
          <Button onClick={onAction}>
            {ActionIcon && <ActionIcon className="h-4 w-4" />}
            {actionLabel}
          </Button>
        )
      )}
    </motion.div>
  )
}
