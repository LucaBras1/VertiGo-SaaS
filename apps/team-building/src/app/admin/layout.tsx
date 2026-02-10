import { AdminLayoutClient } from '@vertigo/admin'
import { teamBuildingAdminConfig } from '@/config/admin-config'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AdminLayoutClient config={teamBuildingAdminConfig}>{children}</AdminLayoutClient>
}
