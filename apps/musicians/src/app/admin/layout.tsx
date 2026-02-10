import { AdminLayoutClient } from '@vertigo/admin'
import { musiciansAdminConfig } from '@/config/admin-config'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminLayoutClient config={musiciansAdminConfig}>
      {children}
    </AdminLayoutClient>
  )
}
