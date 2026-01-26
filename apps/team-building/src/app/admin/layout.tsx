/**
 * Admin Dashboard Layout
 */

import Link from 'next/link'
import { Users, Activity, Calendar, FileText, Settings, BarChart3, Brain, Target, ShoppingCart, Receipt, Package } from 'lucide-react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: BarChart3 },
    { name: 'Programs', href: '/admin/programs', icon: Users },
    { name: 'Activities', href: '/admin/activities', icon: Activity },
    { name: 'Sessions', href: '/admin/sessions', icon: Calendar },
    { name: 'Customers', href: '/admin/customers', icon: Users },
    {
      name: 'Sales',
      href: '#',
      icon: ShoppingCart,
      isSection: true,
      children: [
        { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
        { name: 'Invoices', href: '/admin/invoices', icon: Receipt },
        { name: 'Extras', href: '/admin/extras', icon: Package },
      ]
    },
    { name: 'Reports', href: '/admin/reports', icon: FileText },
    {
      name: 'AI Tools',
      href: '#',
      icon: Brain,
      isSection: true,
      children: [
        { name: 'Team Analysis', href: '/admin/ai/team-analysis', icon: Brain },
        { name: 'Objective Matcher', href: '/admin/ai/objective-matcher', icon: Target },
      ]
    },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/admin" className="flex items-center gap-2">
              <Users className="w-8 h-8 text-brand-primary" />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
                TeamForge Admin
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/" className="text-sm text-gray-600 hover:text-brand-primary">
                View Site
              </Link>
              <div className="h-8 w-8 bg-brand-primary rounded-full flex items-center justify-center text-white text-sm font-semibold">
                A
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)] sticky top-16">
          <nav className="p-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon

              // Section with children
              if ('isSection' in item && item.isSection && 'children' in item) {
                return (
                  <div key={item.name} className="pt-2">
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {item.name}
                    </div>
                    <div className="space-y-1">
                      {item.children?.map((child) => {
                        const ChildIcon = child.icon
                        return (
                          <Link
                            key={child.name}
                            href={child.href}
                            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-brand-primary rounded-lg transition-colors group"
                          >
                            <ChildIcon className="w-5 h-5 group-hover:text-brand-primary" />
                            <span className="font-medium">{child.name}</span>
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                )
              }

              // Regular navigation item
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-brand-primary rounded-lg transition-colors group"
                >
                  <Icon className="w-5 h-5 group-hover:text-brand-primary" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
