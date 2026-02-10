'use client'

import { AdminLayoutClient } from '@vertigo/admin'
import { eventsAdminConfig } from '@/config/admin-config'
import { ErrorBoundary } from '@/components/error-boundary'
import { ConfirmDialogProvider } from '@/components/ui/confirm-dialog'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminLayoutClient config={eventsAdminConfig}>
      <ErrorBoundary>
        <ConfirmDialogProvider>
          {children}
        </ConfirmDialogProvider>
      </ErrorBoundary>
    </AdminLayoutClient>
  )
}
