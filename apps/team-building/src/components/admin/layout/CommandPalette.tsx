'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  BarChart3,
  Users,
  Activity,
  Calendar,
  ShoppingCart,
  Receipt,
  Package,
  FileText,
  TrendingUp,
  Mail,
  Brain,
  Target,
  Settings,
  Plus,
  ArrowRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface CommandItem {
  id: string
  label: string
  icon: React.ElementType
  href: string
  group: 'Pages' | 'Actions' | 'AI Tools'
  keywords?: string[]
}

const commands: CommandItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3, href: '/admin', group: 'Pages' },
  { id: 'programs', label: 'Programs', icon: Users, href: '/admin/programs', group: 'Pages' },
  { id: 'activities', label: 'Activities', icon: Activity, href: '/admin/activities', group: 'Pages' },
  { id: 'sessions', label: 'Sessions', icon: Calendar, href: '/admin/sessions', group: 'Pages' },
  { id: 'customers', label: 'Customers', icon: Users, href: '/admin/customers', group: 'Pages' },
  { id: 'orders', label: 'Orders', icon: ShoppingCart, href: '/admin/orders', group: 'Pages' },
  { id: 'invoices', label: 'Invoices', icon: Receipt, href: '/admin/invoices', group: 'Pages' },
  { id: 'extras', label: 'Extras', icon: Package, href: '/admin/extras', group: 'Pages' },
  { id: 'reports', label: 'Reports', icon: FileText, href: '/admin/reports', group: 'Pages' },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp, href: '/admin/analytics', group: 'Pages' },
  { id: 'email-sequences', label: 'Email Sequences', icon: Mail, href: '/admin/email-sequences', group: 'Pages' },
  { id: 'settings', label: 'Settings', icon: Settings, href: '/admin/settings', group: 'Pages' },
  { id: 'new-program', label: 'Create Program', icon: Plus, href: '/admin/programs/new', group: 'Actions', keywords: ['new', 'add'] },
  { id: 'new-activity', label: 'Add Activity', icon: Plus, href: '/admin/activities/new', group: 'Actions', keywords: ['new', 'create'] },
  { id: 'new-session', label: 'Schedule Session', icon: Plus, href: '/admin/sessions/new', group: 'Actions', keywords: ['new', 'create', 'book'] },
  { id: 'new-customer', label: 'Add Customer', icon: Plus, href: '/admin/customers/new', group: 'Actions', keywords: ['new', 'create'] },
  { id: 'team-analysis', label: 'Team Analysis', icon: Brain, href: '/admin/ai/team-analysis', group: 'AI Tools', keywords: ['ai', 'analyze'] },
  { id: 'objective-matcher', label: 'Objective Matcher', icon: Target, href: '/admin/ai/objective-matcher', group: 'AI Tools', keywords: ['ai', 'match'] },
]

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const filtered = query
    ? commands.filter(
        (cmd) =>
          cmd.label.toLowerCase().includes(query.toLowerCase()) ||
          cmd.keywords?.some((k) => k.toLowerCase().includes(query.toLowerCase()))
      )
    : commands

  const groups = ['Pages', 'Actions', 'AI Tools'] as const
  const groupedResults = groups
    .map((group) => ({
      group,
      items: filtered.filter((cmd) => cmd.group === group),
    }))
    .filter((g) => g.items.length > 0)

  const flatItems = groupedResults.flatMap((g) => g.items)

  const open = useCallback(() => {
    setIsOpen(true)
    setQuery('')
    setSelectedIndex(0)
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
    setQuery('')
  }, [])

  const select = useCallback(
    (item: CommandItem) => {
      close()
      router.push(item.href)
    },
    [close, router]
  )

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        isOpen ? close() : open()
      }
      if (!isOpen) return
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((i) => (i + 1) % flatItems.length)
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((i) => (i - 1 + flatItems.length) % flatItems.length)
      }
      if (e.key === 'Enter' && flatItems[selectedIndex]) {
        e.preventDefault()
        select(flatItems[selectedIndex])
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, open, close, select, flatItems, selectedIndex])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  return (
    <>
      <button
        onClick={open}
        className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-sm text-neutral-500 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Search...</span>
        <kbd className="hidden rounded bg-neutral-200 px-1.5 py-0.5 text-[10px] font-medium text-neutral-500 sm:inline dark:bg-neutral-700 dark:text-neutral-400">
          {typeof navigator !== 'undefined' && /Mac/.test(navigator.userAgent) ? '\u2318' : 'Ctrl+'}K
        </kbd>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              onClick={close}
            />
            <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[15vh] sm:pt-[20vh]">
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -8 }}
                transition={{ duration: 0.15 }}
                className="w-full max-w-lg overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl sm:max-h-[70vh] max-h-[80vh] dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div className="flex items-center gap-3 border-b border-neutral-100 px-4 dark:border-neutral-800">
                  <Search className="h-4 w-4 text-neutral-400" />
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search pages, actions, AI tools..."
                    className="flex-1 border-0 bg-transparent py-4 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 dark:text-neutral-100"
                  />
                  <kbd className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] text-neutral-400 dark:bg-neutral-800">
                    ESC
                  </kbd>
                </div>

                <div className="max-h-72 overflow-y-auto p-2 scrollbar-thin">
                  {groupedResults.length === 0 ? (
                    <div className="py-8 text-center text-sm text-neutral-500">
                      No results found
                    </div>
                  ) : (
                    groupedResults.map((group) => (
                      <div key={group.group}>
                        <div className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                          {group.group}
                        </div>
                        {group.items.map((item) => {
                          const globalIndex = flatItems.indexOf(item)
                          const Icon = item.icon
                          return (
                            <button
                              key={item.id}
                              onClick={() => select(item)}
                              onMouseEnter={() => setSelectedIndex(globalIndex)}
                              className={cn(
                                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                                globalIndex === selectedIndex
                                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300'
                                  : 'text-neutral-600 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:bg-neutral-800'
                              )}
                            >
                              <Icon className="h-4 w-4 flex-shrink-0" />
                              <span className="flex-1 text-left">{item.label}</span>
                              {globalIndex === selectedIndex && (
                                <ArrowRight className="h-3.5 w-3.5 text-neutral-400" />
                              )}
                            </button>
                          )
                        })}
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
