'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Clapperboard,
  Calendar,
  Users,
  Building2,
  FileText,
  Package,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Productions', href: '/dashboard/productions', icon: Clapperboard },
  { name: 'Rehearsals', href: '/dashboard/rehearsals', icon: Calendar },
  { name: 'Cast & Crew', href: '/dashboard/cast-crew', icon: Users },
  { name: 'Venues', href: '/dashboard/venues', icon: Building2 },
  { name: 'Tech Riders', href: '/dashboard/tech-riders', icon: FileText },
  { name: 'Equipment', href: '/dashboard/equipment', icon: Package },
]

const bottomNavigation = [
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <span className="text-xl font-bold text-gray-900">StageManager</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <item.icon
                className={cn('w-5 h-5', isActive ? 'text-primary-500' : 'text-gray-400')}
              />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Bottom navigation */}
      <div className="px-4 py-4 border-t border-gray-200">
        {bottomNavigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <item.icon
                className={cn('w-5 h-5', isActive ? 'text-primary-500' : 'text-gray-400')}
              />
              {item.name}
            </Link>
          )
        })}
      </div>
    </aside>
  )
}
