'use client'

/**
 * Admin Sidebar Navigation
 *
 * Collapsible sidebar with categorized navigation
 * - PRODUKCE: Performances, Games, Services, Events
 * - OBCHOD: Orders, Customers, Invoices
 * - OBSAH: Posts, Pages, Team
 * - SPRÁVA: Settings
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  ChevronLeft,
  ChevronRight,
  Theater,
  Gamepad2,
  Wrench,
  Calendar,
  ShoppingCart,
  Users,
  FileText,
  Newspaper,
  File,
  UserCircle,
  Settings,
  Upload,
  Menu,
  X,
  ExternalLink,
  LogOut,
  MessageSquare
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import { useAdminUIStore } from '@/stores/adminUIStore'
import { cn } from '@/lib/utils'
import { ThemeToggle } from './ThemeToggle'

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  count?: number
}

interface NavSection {
  title: string
  items: NavItem[]
}

const navigation: NavSection[] = [
  {
    title: 'PRODUKCE',
    items: [
      { name: 'Inscenace', href: '/admin/performances', icon: Theater },
      { name: 'Hry', href: '/admin/games', icon: Gamepad2 },
      { name: 'Služby', href: '/admin/services', icon: Wrench },
      { name: 'Akce', href: '/admin/events', icon: Calendar },
    ],
  },
  {
    title: 'OBCHOD',
    items: [
      { name: 'Objednávky', href: '/admin/orders', icon: ShoppingCart },
      { name: 'Zákazníci', href: '/admin/customers', icon: Users },
      { name: 'Fakturace', href: '/admin/invoicing', icon: FileText },
      { name: 'Zprávy', href: '/admin/messages', icon: MessageSquare },
    ],
  },
  {
    title: 'OBSAH',
    items: [
      { name: 'Aktuality', href: '/admin/posts', icon: Newspaper },
      { name: 'Stránky', href: '/admin/pages', icon: File },
      { name: 'Tým', href: '/admin/team', icon: UserCircle },
    ],
  },
  {
    title: 'SPRÁVA',
    items: [
      { name: 'Import dat', href: '/admin/import', icon: Upload },
      { name: 'Nastavení', href: '/admin/settings', icon: Settings },
    ],
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { sidebarCollapsed, toggleSidebar, darkMode } = useAdminUIStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={cn(
            'p-2 rounded-md shadow-lg',
            darkMode
              ? 'bg-neutral-gray-800 text-gray-300 hover:text-gray-100'
              : 'bg-white text-gray-600 hover:text-gray-900'
          )}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile backdrop */}
      {mobileMenuOpen && (
        <div
          className={cn(
            'lg:hidden fixed inset-0 z-40',
            darkMode ? 'bg-black bg-opacity-75' : 'bg-gray-600 bg-opacity-75'
          )}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out',
          darkMode
            ? 'bg-neutral-gray-800 border-r border-neutral-gray-700'
            : 'bg-white border-r border-gray-200',
          'lg:translate-x-0',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          sidebarCollapsed ? 'w-20' : 'w-64'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className={cn(
            'flex items-center justify-between h-16 px-4 border-b',
            darkMode ? 'border-neutral-gray-700' : 'border-gray-200'
          )}>
            {!sidebarCollapsed && (
              <Link href="/admin" className="flex items-center gap-2">
                <Home className="h-6 w-6 text-blue-600" />
                <span className={cn(
                  'text-lg font-bold',
                  darkMode ? 'text-gray-100' : 'text-gray-900'
                )}>Admin</span>
              </Link>
            )}
            {sidebarCollapsed && (
              <Link href="/admin" className="flex items-center justify-center w-full">
                <Home className="h-6 w-6 text-blue-600" />
              </Link>
            )}
            <button
              onClick={toggleSidebar}
              className={cn(
                'hidden lg:block p-1.5 rounded-md',
                darkMode
                  ? 'hover:bg-neutral-gray-700 text-gray-400 hover:text-gray-200'
                  : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
              )}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <ChevronLeft className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            {/* Dashboard */}
            <Link
              href="/admin"
              className={cn(
                'flex items-center gap-3 px-4 py-3 mx-2 rounded-md transition-colors',
                pathname === '/admin'
                  ? darkMode
                    ? 'bg-blue-900/40 text-blue-400'
                    : 'bg-blue-50 text-blue-700'
                  : darkMode
                    ? 'text-gray-300 hover:bg-neutral-gray-700'
                    : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              <Home className="h-5 w-5 flex-shrink-0" />
              {!sidebarCollapsed && <span className="font-medium min-w-0 truncate">Dashboard</span>}
            </Link>

            {/* Sections */}
            {navigation.map((section) => (
              <div key={section.title} className="mt-6">
                {!sidebarCollapsed && (
                  <div className="px-4 mb-2">
                    <h3 className={cn(
                      'text-xs font-semibold uppercase tracking-wider',
                      darkMode ? 'text-gray-500' : 'text-gray-500'
                    )}>
                      {section.title}
                    </h3>
                  </div>
                )}
                {sidebarCollapsed && (
                  <div className="px-4 mb-2">
                    <div className={cn(
                      'h-px',
                      darkMode ? 'bg-neutral-gray-700' : 'bg-gray-200'
                    )} />
                  </div>
                )}
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
                    const Icon = item.icon

                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                          'flex items-center gap-3 px-4 py-3 mx-2 rounded-md transition-colors relative',
                          isActive
                            ? darkMode
                              ? 'bg-blue-900/40 text-blue-400'
                              : 'bg-blue-50 text-blue-700'
                            : darkMode
                              ? 'text-gray-300 hover:bg-neutral-gray-700'
                              : 'text-gray-700 hover:bg-gray-100'
                        )}
                        title={sidebarCollapsed ? item.name : undefined}
                      >
                        <Icon className="h-5 w-5 flex-shrink-0" />
                        {!sidebarCollapsed && (
                          <>
                            <span className="flex-1 min-w-0 truncate">{item.name}</span>
                            {item.count && item.count > 0 && (
                              <span className={cn(
                                'inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full',
                                darkMode
                                  ? 'bg-blue-900/50 text-blue-400'
                                  : 'bg-blue-100 text-blue-700'
                              )}>
                                {item.count}
                              </span>
                            )}
                          </>
                        )}
                        {sidebarCollapsed && item.count && item.count > 0 && (
                          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold rounded-full bg-blue-600 text-white">
                            {item.count}
                          </span>
                        )}
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div className={cn(
            'border-t p-4 space-y-2',
            darkMode ? 'border-neutral-gray-700' : 'border-gray-200'
          )}>
            {/* Theme Toggle */}
            <ThemeToggle collapsed={sidebarCollapsed} />

            <Link
              href="/"
              target="_blank"
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-md transition-colors',
                darkMode
                  ? 'text-gray-400 hover:bg-neutral-gray-700 hover:text-gray-200'
                  : 'text-gray-600 hover:bg-gray-100',
                sidebarCollapsed && 'justify-center'
              )}
            >
              <ExternalLink className="h-5 w-5 flex-shrink-0" />
              {!sidebarCollapsed && <span className="text-sm min-w-0 truncate">Zobrazit web</span>}
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/admin/login' })}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-md transition-colors',
                darkMode
                  ? 'text-red-400 hover:bg-red-900/30'
                  : 'text-red-600 hover:bg-red-50',
                sidebarCollapsed && 'justify-center'
              )}
              title={sidebarCollapsed ? 'Odhlásit se' : undefined}
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              {!sidebarCollapsed && <span className="text-sm min-w-0 truncate">Odhlásit se</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
