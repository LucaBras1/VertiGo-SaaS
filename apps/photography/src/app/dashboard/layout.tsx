'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import {
  Camera,
  Package,
  Calendar,
  ListChecks,
  Images,
  Users,
  FileText,
  FileSignature,
  Settings,
  Menu,
  Bell,
  Search,
  LogOut
} from 'lucide-react'
import { clsx } from 'clsx'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 h-16">
        <div className="flex items-center justify-between h-full px-4">
          <div className="flex items-center space-x-4">
            <button className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
              <Menu className="w-6 h-6" />
            </button>

            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-amber-600 to-gray-700 bg-clip-text text-transparent hidden sm:inline">
                ShootFlow
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center bg-gray-100 rounded-lg px-4 py-2 w-96">
              <Search className="w-5 h-5 text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Search packages, clients, galleries..."
                className="bg-transparent outline-none w-full"
              />
            </div>

            <button className="relative p-2 hover:bg-gray-100 rounded-lg">
              <Bell className="w-6 h-6 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full" />
            </button>

            <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold">{session?.user?.name || 'Photographer'}</p>
                <p className="text-xs text-gray-500">{session?.user?.tenantName || 'Studio'}</p>
              </div>
              <button className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center text-white font-semibold">
                {session?.user?.name?.charAt(0) || 'P'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <aside className="fixed top-16 left-0 bottom-0 w-64 bg-white border-r border-gray-200 overflow-y-auto hidden lg:block">
        <nav className="p-4 space-y-2">
          <NavItem href="/dashboard" icon={<Camera />} label="Dashboard" active={pathname === '/dashboard'} />
          <NavItem href="/dashboard/packages" icon={<Package />} label="Packages" active={pathname.startsWith('/dashboard/packages')} />
          <NavItem href="/dashboard/shoots" icon={<Calendar />} label="Shoots" active={pathname.startsWith('/dashboard/shoots')} />
          <NavItem href="/dashboard/shot-lists" icon={<ListChecks />} label="Shot Lists" active={pathname.startsWith('/dashboard/shot-lists')} />
          <NavItem href="/dashboard/galleries" icon={<Images />} label="Galleries" active={pathname.startsWith('/dashboard/galleries')} />
          <NavItem href="/dashboard/clients" icon={<Users />} label="Clients" active={pathname.startsWith('/dashboard/clients')} />
          <NavItem href="/dashboard/contracts" icon={<FileSignature />} label="Contracts" active={pathname.startsWith('/dashboard/contracts')} />
          <NavItem href="/dashboard/invoices" icon={<FileText />} label="Invoices" active={pathname.startsWith('/dashboard/invoices')} />

          <div className="pt-6 pb-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3">
              Settings
            </p>
          </div>

          <NavItem href="/dashboard/settings" icon={<Settings />} label="Settings" active={pathname.startsWith('/dashboard/settings')} />
          <button
            onClick={() => signOut({ callbackUrl: '/auth/login' })}
            className="flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-gray-600 hover:bg-gray-50 w-full"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </nav>

        {/* Upgrade Card */}
        <div className="m-4 p-4 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl text-white">
          <h3 className="font-semibold mb-2">Upgrade to Pro</h3>
          <p className="text-sm text-amber-100 mb-4">
            Unlock unlimited shoots and AI features
          </p>
          <button className="w-full bg-white text-amber-600 font-semibold py-2 rounded-lg hover:bg-gray-100 transition-colors">
            Upgrade Now
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:pl-64 pt-16">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}

function NavItem({
  href,
  icon,
  label,
  active = false
}: {
  href: string
  icon: React.ReactNode
  label: string
  active?: boolean
}) {
  return (
    <Link
      href={href}
      className={clsx(
        'flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors',
        active
          ? 'bg-amber-50 text-amber-600'
          : 'text-gray-600 hover:bg-gray-50'
      )}
    >
      <span className="w-5 h-5">{icon}</span>
      <span className="font-medium">{label}</span>
    </Link>
  )
}
