import { AdminLayoutClient } from '@vertigo/admin'
import { kidsEntertainmentAdminConfig } from '@/config/admin-config'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminLayoutClient config={kidsEntertainmentAdminConfig}>
      {children}
    </AdminLayoutClient>
  )
}
