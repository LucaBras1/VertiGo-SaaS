'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/navigation/Sidebar'
import { UserMenu } from '@/components/navigation/UserMenu'
import { SearchDropdown } from '@/components/navigation/SearchDropdown'
import { NotificationsPanel } from '@/components/navigation/NotificationsPanel'
import { useUIStore } from '@/stores/uiStore'
import { cn } from '@/lib/utils'
import { Bell } from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { sidebarCollapsed } = useUIStore()
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />

      {/* Main content */}
      <div
        className={cn(
          'transition-all duration-300 ease-in-out',
          sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        )}
      >
        {/* Top header */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            {/* Search */}
            <SearchDropdown />

            {/* Right side */}
            <div className="flex items-center gap-4 ml-4">
              {/* Notifications */}
              <button
                onClick={() => setNotificationsOpen(true)}
                className="relative p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-primary-500 ring-2 ring-white" />
              </button>

              {/* User menu */}
              <UserMenu />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main>{children}</main>
      </div>

      {/* Notifications Panel */}
      <NotificationsPanel
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />
    </div>
  )
}
