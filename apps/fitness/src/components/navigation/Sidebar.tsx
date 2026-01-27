'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  Home,
  ChevronLeft,
  ChevronRight,
  Users,
  Calendar,
  Dumbbell,
  Package,
  FileText,
  Settings,
  Menu,
  X,
  ExternalLink,
  LogOut,
  TrendingUp,
  LayoutGrid,
  BarChart3,
  FileBarChart,
  Receipt,
  ClipboardList,
  CalendarClock,
  Gift,
  RefreshCw,
  Mail,
} from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'
import { cn } from '@/lib/utils'

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

interface NavSection {
  title: string
  items: NavItem[]
}

const navigation: NavSection[] = [
  {
    title: 'KLIENTI',
    items: [
      { name: 'Klienti', href: '/dashboard/clients', icon: Users },
      { name: 'Progress', href: '/dashboard/progress', icon: TrendingUp },
      { name: 'Doporučení', href: '/dashboard/referrals', icon: Gift },
    ],
  },
  {
    title: 'TRÉNINKY',
    items: [
      { name: 'Sessions', href: '/dashboard/sessions', icon: Calendar },
      { name: 'Skupinové lekce', href: '/dashboard/classes', icon: LayoutGrid },
    ],
  },
  {
    title: 'OBCHOD',
    items: [
      { name: 'Balíčky', href: '/dashboard/packages', icon: Package },
      { name: 'Předplatné', href: '/dashboard/subscriptions', icon: RefreshCw },
      { name: 'Faktury', href: '/dashboard/invoices', icon: FileText },
      { name: 'Výdaje', href: '/dashboard/expenses', icon: Receipt },
    ],
  },
  {
    title: 'ANALYTIKA',
    items: [
      { name: 'Přehled', href: '/dashboard/analytics', icon: BarChart3 },
      { name: 'Reporty', href: '/dashboard/reports', icon: FileBarChart },
    ],
  },
  {
    title: 'MARKETING',
    items: [
      { name: 'Email sekvence', href: '/dashboard/email-sequences', icon: Mail },
    ],
  },
  {
    title: 'KNIHOVNA',
    items: [
      { name: 'Šablony tréninků', href: '/dashboard/templates', icon: ClipboardList },
      { name: 'Šablony rozvrhu', href: '/dashboard/schedule-templates', icon: CalendarClock },
    ],
  },
  {
    title: 'NASTAVENÍ',
    items: [
      { name: 'Nastavení', href: '/dashboard/settings', icon: Settings },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarCollapsed, toggleSidebar } = useUIStore()
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
          className="p-2 rounded-lg bg-white shadow-lg text-gray-600 hover:text-gray-900"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile backdrop */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-gray-600 bg-opacity-75"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out',
          'bg-secondary-800 border-r border-secondary-700',
          'lg:translate-x-0',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          sidebarCollapsed ? 'w-20' : 'w-64'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-secondary-700">
            {!sidebarCollapsed && (
              <Link href="/dashboard" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                  <Dumbbell className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold text-white">FitAdmin</span>
              </Link>
            )}
            {sidebarCollapsed && (
              <Link href="/dashboard" className="flex items-center justify-center w-full">
                <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                  <Dumbbell className="h-5 w-5 text-white" />
                </div>
              </Link>
            )}
            <button
              onClick={toggleSidebar}
              className="hidden lg:block p-1.5 rounded-md hover:bg-secondary-700 text-gray-400 hover:text-gray-200"
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
              href="/dashboard"
              className={cn(
                'flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors',
                pathname === '/dashboard'
                  ? 'bg-primary-600/30 text-primary-400'
                  : 'text-gray-300 hover:bg-secondary-700'
              )}
            >
              <Home className="h-5 w-5 flex-shrink-0" />
              {!sidebarCollapsed && <span className="font-medium">Dashboard</span>}
            </Link>

            {/* Sections */}
            {navigation.map((section) => (
              <div key={section.title} className="mt-6">
                {!sidebarCollapsed && (
                  <div className="px-4 mb-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                      {section.title}
                    </h3>
                  </div>
                )}
                {sidebarCollapsed && (
                  <div className="px-4 mb-2">
                    <div className="h-px bg-secondary-700" />
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
                          'flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors',
                          isActive
                            ? 'bg-primary-600/30 text-primary-400'
                            : 'text-gray-300 hover:bg-secondary-700'
                        )}
                        title={sidebarCollapsed ? item.name : undefined}
                      >
                        <Icon className="h-5 w-5 flex-shrink-0" />
                        {!sidebarCollapsed && <span className="flex-1">{item.name}</span>}
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div className="border-t border-secondary-700 p-4 space-y-2">
            <Link
              href="/"
              target="_blank"
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                'text-gray-400 hover:bg-secondary-700 hover:text-gray-200',
                sidebarCollapsed && 'justify-center'
              )}
            >
              <ExternalLink className="h-5 w-5 flex-shrink-0" />
              {!sidebarCollapsed && <span className="text-sm">Zobrazit web</span>}
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                'text-red-400 hover:bg-red-900/30',
                sidebarCollapsed && 'justify-center'
              )}
              title={sidebarCollapsed ? 'Odhlásit se' : undefined}
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              {!sidebarCollapsed && <span className="text-sm">Odhlásit se</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
