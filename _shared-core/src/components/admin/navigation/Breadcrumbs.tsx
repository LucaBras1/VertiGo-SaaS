'use client'

/**
 * Breadcrumbs Navigation
 *
 * Auto-generates breadcrumbs from pathname
 * Shows user's location in the admin hierarchy
 */

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { generateBreadcrumbs, truncateBreadcrumbTitle } from '@/lib/breadcrumbs'
import { cn } from '@/lib/utils'

interface BreadcrumbsProps {
  /**
   * Optional custom title for the current page (e.g. entity name)
   */
  entityTitle?: string

  /**
   * Additional className for the container
   */
  className?: string
}

export function Breadcrumbs({ entityTitle, className }: BreadcrumbsProps) {
  const pathname = usePathname()

  // Nezobrazovat na hlavní admin stránce
  if (pathname === '/admin') {
    return null
  }

  const breadcrumbs = generateBreadcrumbs(pathname, entityTitle)

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('mb-6', className)}
    >
      <ol className="flex items-center space-x-2 text-sm">
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1
          const isFirst = index === 0

          return (
            <li key={crumb.href} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
              )}

              {isLast ? (
                // Poslední breadcrumb - není klikatelný
                <span className="font-medium text-gray-900 flex items-center gap-1.5">
                  {isFirst && <Home className="h-4 w-4" />}
                  {truncateBreadcrumbTitle(crumb.label)}
                </span>
              ) : (
                // Ostatní breadcrumbs - klikatelné
                <Link
                  href={crumb.href}
                  className="text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1.5"
                >
                  {isFirst && <Home className="h-4 w-4" />}
                  {crumb.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
