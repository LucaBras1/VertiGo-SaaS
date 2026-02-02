'use client'

import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  Calendar,
  Users,
  MapPin,
  UserCircle2,
  BarChart3,
  Settings,
  Menu,
  Bell,
  Search,
  LogOut,
} from 'lucide-react'
import { ErrorBoundary } from '@/components/error-boundary'
import { ConfirmDialogProvider } from '@/components/ui/confirm-dialog'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session } = useSession()
  const pathname = usePathname()

  const userInitials = session?.user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U'

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' })
  }

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
              <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-accent-500 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-display font-bold gradient-text hidden sm:inline">
                EventPro
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center bg-gray-100 rounded-lg px-4 py-2 w-96">
              <Search className="w-5 h-5 text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Search events, performers..."
                className="bg-transparent outline-none w-full"
              />
            </div>

            <button className="relative p-2 hover:bg-gray-100 rounded-lg">
              <Bell className="w-6 h-6 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-accent-500 rounded-full" />
            </button>

            <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold">{session?.user?.name || 'User'}</p>
                <p className="text-xs text-gray-500">{session?.user?.tenantName || 'Event Manager'}</p>
              </div>
              <button className="w-10 h-10 bg-gradient-to-br from-primary-600 to-accent-500 rounded-full flex items-center justify-center text-white font-semibold">
                {userInitials}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <aside className="fixed top-16 left-0 bottom-0 w-64 bg-white border-r border-gray-200 overflow-y-auto hidden lg:block">
        <nav className="p-4 space-y-2">
          <NavItem href="/dashboard" icon={<BarChart3 />} label="Overview" active={pathname === '/dashboard'} />
          <NavItem href="/dashboard/events" icon={<Calendar />} label="Events" active={pathname.startsWith('/dashboard/events')} />
          <NavItem href="/dashboard/performers" icon={<Users />} label="Performers" active={pathname.startsWith('/dashboard/performers')} />
          <NavItem href="/dashboard/venues" icon={<MapPin />} label="Venues" active={pathname.startsWith('/dashboard/venues')} />
          <NavItem href="/dashboard/clients" icon={<UserCircle2 />} label="Clients" active={pathname.startsWith('/dashboard/clients')} />

          <div className="pt-6 pb-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3">
              Settings
            </p>
          </div>

          <NavItem href="/dashboard/settings" icon={<Settings />} label="Settings" active={pathname.startsWith('/dashboard/settings')} />
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-gray-600 hover:bg-gray-50 w-full"
          >
            <span className="w-5 h-5"><LogOut /></span>
            <span className="font-medium">Logout</span>
          </button>
        </nav>

        {/* Upgrade Card */}
        <div className="m-4 p-4 bg-gradient-to-br from-primary-600 to-accent-500 rounded-xl text-white">
          <h3 className="font-semibold mb-2">Upgrade to Pro</h3>
          <p className="text-sm text-primary-100 mb-4">
            Unlock unlimited events and AI features
          </p>
          <button className="w-full bg-white text-primary-600 font-semibold py-2 rounded-lg hover:bg-gray-100 transition-colors">
            Upgrade Now
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:pl-64 pt-16">
        <div className="p-6">
          <ErrorBoundary>
            <ConfirmDialogProvider>{children}</ConfirmDialogProvider>
          </ErrorBoundary>
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
      className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
        active
          ? 'bg-primary-50 text-primary-600'
          : 'text-gray-600 hover:bg-gray-50'
      }`}
    >
      <span className="w-5 h-5">{icon}</span>
      <span className="font-medium">{label}</span>
    </Link>
  )
}
