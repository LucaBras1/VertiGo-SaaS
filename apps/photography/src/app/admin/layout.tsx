import { AdminLayoutClient } from '@vertigo/admin'
import { photographyAdminConfig } from '@/config/admin-config'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminLayoutClient config={photographyAdminConfig}>
      {children}
    </AdminLayoutClient>
  )
}
