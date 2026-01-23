/**
 * Admin Layout
 *
 * Layout with sidebar navigation for authenticated pages.
 * Login page gets minimal layout without sidebar (handled by AdminLayoutWrapper).
 */

import { Suspense } from 'react'
import { ToastProvider } from '@/components/admin/notifications/ToastProvider'
import { GlobalSearch } from '@/components/admin/search/GlobalSearch'
import { AdminLayoutWrapper } from '@/components/admin/layout/AdminLayoutWrapper'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {/* Toast Notifications Provider */}
      <ToastProvider />

      {/* Global Search Modal */}
      <GlobalSearch />

      {/* Conditional layout - login page without sidebar */}
      <AdminLayoutWrapper>
        <Suspense fallback={
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">Načítání...</div>
          </div>
        }>
          {children}
        </Suspense>
      </AdminLayoutWrapper>
    </>
  )
}
