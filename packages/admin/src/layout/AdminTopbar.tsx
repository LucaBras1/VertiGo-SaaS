'use client'

import { Menu } from 'lucide-react'
import { motion } from 'framer-motion'
import { Breadcrumbs } from './Breadcrumbs'
import { CommandPalette } from './CommandPalette'
import { ThemeToggle } from './ThemeToggle'
import { UserMenu } from './UserMenu'
import type { AdminConfig } from '../types'

interface AdminTopbarProps {
  config: AdminConfig
  sidebarWidth: number
  onMobileMenuToggle: () => void
}

export function AdminTopbar({ config, sidebarWidth, onMobileMenuToggle }: AdminTopbarProps) {
  return (
    <motion.header
      className="fixed top-0 right-0 z-20 h-14 border-b border-neutral-200/60 glass dark:border-neutral-800/60"
      animate={{ left: sidebarWidth }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="flex h-full items-center justify-between px-4 sm:px-6">
        {/* Left: mobile menu + breadcrumbs */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMobileMenuToggle}
            className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 lg:hidden dark:text-neutral-400 dark:hover:bg-neutral-800"
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Breadcrumbs basePath={config.basePath} labelMap={config.breadcrumbLabels} />
        </div>

        {/* Right: search, theme, user */}
        <div className="flex items-center gap-2">
          <CommandPalette commands={config.commands} groups={config.commandGroups} />
          <ThemeToggle />
          <UserMenu basePath={config.basePath} />
        </div>
      </div>
    </motion.header>
  )
}
