'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'
import { motion } from 'framer-motion'

const labelMap: Record<string, string> = {
  admin: 'Dashboard',
  programs: 'Programs',
  activities: 'Activities',
  sessions: 'Sessions',
  customers: 'Customers',
  orders: 'Orders',
  invoices: 'Invoices',
  extras: 'Extras',
  reports: 'Reports',
  analytics: 'Analytics',
  settings: 'Settings',
  ai: 'AI Tools',
  'team-analysis': 'Team Analysis',
  'objective-matcher': 'Objective Matcher',
  'email-sequences': 'Email Sequences',
  new: 'New',
}

export function Breadcrumbs() {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length <= 1) return null

  const crumbs = segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/')
    const isLast = index === segments.length - 1
    const label = labelMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)

    // Skip ID segments (UUID-like or numeric)
    if (/^[0-9a-f-]{8,}$/.test(segment) || /^\d+$/.test(segment)) {
      return { href, label: 'Detail', isLast }
    }

    return { href, label, isLast }
  })

  return (
    <motion.nav
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      aria-label="Breadcrumb"
      className="flex items-center gap-1 text-sm"
    >
      <Link
        href="/admin"
        className="flex items-center text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300"
      >
        <Home className="h-3.5 w-3.5" />
      </Link>
      {crumbs.slice(1).map((crumb) => (
        <div key={crumb.href} className="flex items-center gap-1">
          <ChevronRight className="h-3.5 w-3.5 text-neutral-300 dark:text-neutral-600" />
          {crumb.isLast ? (
            <span className="font-medium text-neutral-700 dark:text-neutral-200">
              {crumb.label}
            </span>
          ) : (
            <Link
              href={crumb.href}
              className="text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300"
            >
              {crumb.label}
            </Link>
          )}
        </div>
      ))}
    </motion.nav>
  )
}
