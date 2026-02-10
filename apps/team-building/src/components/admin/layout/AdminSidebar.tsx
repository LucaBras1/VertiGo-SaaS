'use client'

import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  Activity,
  Calendar,
  FileText,
  Settings,
  BarChart3,
  Brain,
  Target,
  ShoppingCart,
  Receipt,
  Package,
  Mail,
  TrendingUp,
  ChevronsLeft,
  ChevronsRight,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { SidebarNavItem } from './SidebarNavItem'
import { staggerContainer, staggerItem } from '@vertigo/ui'
import type { LucideIcon } from 'lucide-react'

interface NavItem {
  name: string
  href: string
  icon: LucideIcon
}

interface NavSection {
  name: string
  icon: LucideIcon
  children: NavItem[]
}

type NavEntry = NavItem | NavSection

function isSection(entry: NavEntry): entry is NavSection {
  return 'children' in entry
}

const navigation: NavEntry[] = [
  { name: 'Dashboard', href: '/admin', icon: BarChart3 },
  { name: 'Programs', href: '/admin/programs', icon: Users },
  { name: 'Activities', href: '/admin/activities', icon: Activity },
  { name: 'Sessions', href: '/admin/sessions', icon: Calendar },
  { name: 'Customers', href: '/admin/customers', icon: Users },
  {
    name: 'Sales',
    icon: ShoppingCart,
    children: [
      { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
      { name: 'Invoices', href: '/admin/invoices', icon: Receipt },
      { name: 'Extras', href: '/admin/extras', icon: Package },
    ],
  },
  { name: 'Reports', href: '/admin/reports', icon: FileText },
  { name: 'Analytics', href: '/admin/analytics', icon: TrendingUp },
  {
    name: 'Marketing',
    icon: Mail,
    children: [
      { name: 'Email Sequences', href: '/admin/email-sequences', icon: Mail },
    ],
  },
  {
    name: 'AI Tools',
    icon: Brain,
    children: [
      { name: 'Team Analysis', href: '/admin/ai/team-analysis', icon: Brain },
      { name: 'Objective Matcher', href: '/admin/ai/objective-matcher', icon: Target },
    ],
  },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
]

interface AdminSidebarProps {
  isCollapsed: boolean
  isMobileOpen: boolean
  onToggleCollapse: () => void
  onCloseMobile: () => void
}

export function AdminSidebar({
  isCollapsed,
  isMobileOpen,
  onToggleCollapse,
  onCloseMobile,
}: AdminSidebarProps) {
  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className={cn(
        'flex items-center border-b border-neutral-100 dark:border-neutral-800',
        isCollapsed ? 'justify-center px-2 py-4' : 'gap-2.5 px-4 py-4'
      )}>
        <Link href="/admin" className="flex items-center gap-2.5" onClick={onCloseMobile}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 text-white">
            <Users className="h-4.5 w-4.5" />
          </div>
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="text-base font-bold text-neutral-900 dark:text-neutral-100 whitespace-nowrap"
            >
              TeamForge
            </motion.span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <motion.nav
        className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <div className="space-y-1">
          {navigation.map((entry) => {
            if (isSection(entry)) {
              return (
                <motion.div key={entry.name} variants={staggerItem} className="pt-3">
                  {!isCollapsed && (
                    <div className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
                      {entry.name}
                    </div>
                  )}
                  {isCollapsed && (
                    <div className="mb-1 flex justify-center">
                      <div className="h-px w-5 bg-neutral-200 dark:bg-neutral-700" />
                    </div>
                  )}
                  <div className="space-y-0.5">
                    {entry.children.map((child) => (
                      <SidebarNavItem
                        key={child.name}
                        name={child.name}
                        href={child.href}
                        icon={child.icon}
                        isCollapsed={isCollapsed}
                        onClick={onCloseMobile}
                      />
                    ))}
                  </div>
                </motion.div>
              )
            }

            return (
              <motion.div key={entry.name} variants={staggerItem}>
                <SidebarNavItem
                  name={entry.name}
                  href={entry.href}
                  icon={entry.icon}
                  isCollapsed={isCollapsed}
                  onClick={onCloseMobile}
                />
              </motion.div>
            )
          })}
        </div>
      </motion.nav>

      {/* Collapse toggle (desktop only) */}
      <div className="hidden border-t border-neutral-100 p-3 lg:block dark:border-neutral-800">
        <button
          onClick={onToggleCollapse}
          className="flex w-full items-center justify-center rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronsRight className="h-4 w-4" />
          ) : (
            <ChevronsLeft className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <motion.aside
        className={cn(
          'fixed left-0 top-0 z-30 hidden h-screen border-r border-neutral-200 bg-white lg:block dark:border-neutral-800 dark:bg-neutral-900',
        )}
        animate={{ width: isCollapsed ? 72 : 256 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {sidebarContent}
      </motion.aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
              onClick={onCloseMobile}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 z-50 h-screen w-64 border-r border-neutral-200 bg-white lg:hidden dark:border-neutral-800 dark:bg-neutral-900"
            >
              <button
                onClick={onCloseMobile}
                className="absolute right-3 top-4 rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <X className="h-4 w-4" />
              </button>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
