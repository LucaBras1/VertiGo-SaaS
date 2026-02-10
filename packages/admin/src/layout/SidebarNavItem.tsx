'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { cn } from '../utils'

interface SidebarNavItemProps {
  name: string
  href: string
  icon: LucideIcon
  isCollapsed: boolean
  basePath: string
  onClick?: () => void
}

export function SidebarNavItem({ name, href, icon: Icon, isCollapsed, basePath, onClick }: SidebarNavItemProps) {
  const pathname = usePathname()
  const isActive = href === basePath
    ? pathname === basePath
    : pathname.startsWith(href)

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
        isActive
          ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300'
          : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200',
        isCollapsed && 'justify-center px-2'
      )}
    >
      {isActive && (
        <motion.div
          layoutId="sidebar-active-indicator"
          className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-0.5 rounded-full bg-brand-600 dark:bg-brand-400"
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}
      <Icon className={cn(
        'h-5 w-5 flex-shrink-0',
        isActive ? 'text-brand-600 dark:text-brand-400' : 'text-neutral-400 group-hover:text-neutral-600 dark:text-neutral-500 dark:group-hover:text-neutral-300'
      )} />
      {!isCollapsed && (
        <span className="truncate">{name}</span>
      )}
      {isCollapsed && (
        <div className="absolute left-full ml-2 z-50 hidden group-hover:block">
          <div className="rounded-md bg-neutral-900 px-2.5 py-1.5 text-xs text-white shadow-lg dark:bg-neutral-700">
            {name}
          </div>
        </div>
      )}
    </Link>
  )
}
