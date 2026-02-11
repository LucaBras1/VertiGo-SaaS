'use client'

import { AdminLayoutClient } from '@vertigo/admin'
import { fitnessAdminConfig } from '@/config/admin-config'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminLayoutClient config={fitnessAdminConfig}>
      {children}
    </AdminLayoutClient>
  )
}
