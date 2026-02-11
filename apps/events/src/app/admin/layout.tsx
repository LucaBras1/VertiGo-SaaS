'use client'

import { AdminLayoutClient } from '@vertigo/admin'
import { eventsAdminConfig } from '@/config/admin-config'
import { ErrorBoundary } from '@/components/error-boundary'
import { ConfirmDialogProvider } from '@vertigo/ui'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminLayoutClient config={eventsAdminConfig}>
      <ErrorBoundary>
        <ConfirmDialogProvider
          defaultConfirmText="Potvrdit"
          defaultCancelText="Zrusit"
          defaultDeleteTitle="Smazat polozku"
          defaultDeleteMessage={(name) => `Opravdu chcete smazat "${name}"? Tuto akci nelze vratit.`}
        >
          {children}
        </ConfirmDialogProvider>
      </ErrorBoundary>
    </AdminLayoutClient>
  )
}
