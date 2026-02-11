'use client'

import { AdminLayoutClient } from '@vertigo/admin'
import { performingArtsAdminConfig } from '@/config/admin-config'

export function AdminLayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AdminLayoutClient config={performingArtsAdminConfig}>
      {children}
    </AdminLayoutClient>
  )
}
