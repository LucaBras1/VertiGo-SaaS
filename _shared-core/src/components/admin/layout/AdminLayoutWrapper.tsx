'use client'

/**
 * Admin Layout Wrapper
 *
 * Client component that conditionally renders admin layout based on current path.
 * Login page gets minimal layout without sidebar.
 * Supports dark mode via admin-dark class.
 */

import { usePathname } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/navigation/AdminSidebar'
import { useAdminUIStore } from '@/stores/adminUIStore'
import { cn } from '@/lib/utils'

interface AdminLayoutWrapperProps {
  children: React.ReactNode
}

export function AdminLayoutWrapper({ children }: AdminLayoutWrapperProps) {
  const pathname = usePathname()
  const darkMode = useAdminUIStore((state) => state.darkMode)
  const isLoginPage = pathname === '/admin/login'

  // Login page - minimal layout without sidebar
  if (isLoginPage) {
    return <>{children}</>
  }

  // Other admin pages - full layout with sidebar
  return (
    <div className={cn('min-h-screen admin-content', darkMode && 'admin-dark')}>
      <AdminSidebar />
      <main className="lg:pl-64 transition-all duration-300">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  )
}
