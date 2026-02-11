'use client'

import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { AdminLayoutClient } from '@vertigo/admin'
import { performingArtsAdminConfig } from '@/config/admin-config'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  return <AdminLayoutClient config={performingArtsAdminConfig}>{children}</AdminLayoutClient>
}
