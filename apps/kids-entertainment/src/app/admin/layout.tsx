/**
 * Admin Dashboard Layout
 * Sidebar navigation with PartyPal branding
 */

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import {
  PartyPopper,
  LayoutDashboard,
  Package,
  Puzzle,
  Gift,
  Calendar,
  Users,
  ShoppingCart,
  FileText,
  Sparkles,
  Settings,
  LogOut,
  Menu,
  Bell,
  Search,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function AdminLayout({
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

            <Link href="/admin" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-partypal-pink-500 to-partypal-yellow-500 rounded-lg flex items-center justify-center">
                <PartyPopper className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-partypal-pink-500 to-sky-500 bg-clip-text text-transparent hidden sm:inline">
                PartyPal Admin
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center bg-gray-100 rounded-lg px-4 py-2 w-96">
              <Search className="w-5 h-5 text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Hledat balíčky, aktivity, objednávky..."
                className="bg-transparent outline-none w-full"
              />
            </div>

            <button className="relative p-2 hover:bg-gray-100 rounded-lg">
              <Bell className="w-6 h-6 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-partypal-pink-500 rounded-full" />
            </button>

            <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold">{session?.user?.name || session?.user?.email}</p>
                <p className="text-xs text-gray-500">Admin</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-partypal-pink-500 to-sky-500 rounded-full flex items-center justify-center text-white font-semibold">
                {session?.user?.name?.[0] || session?.user?.email?.[0] || 'A'}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <aside className="fixed top-16 left-0 bottom-0 w-64 bg-white border-r border-gray-200 overflow-y-auto hidden lg:block">
        <nav className="p-4 space-y-2">
          <NavItem
            href="/admin"
            icon={<LayoutDashboard />}
            label="Dashboard"
            active={pathname === '/admin'}
          />
          <NavItem
            href="/admin/packages"
            icon={<Package />}
            label="Balíčky"
            active={pathname?.startsWith('/admin/packages')}
          />
          <NavItem
            href="/admin/activities"
            icon={<Puzzle />}
            label="Aktivity"
            active={pathname?.startsWith('/admin/activities')}
          />
          <NavItem
            href="/admin/extras"
            icon={<Gift />}
            label="Extra doplňky"
            active={pathname?.startsWith('/admin/extras')}
          />
          <NavItem
            href="/admin/parties"
            icon={<Calendar />}
            label="Oslavy"
            active={pathname?.startsWith('/admin/parties')}
          />
          <NavItem
            href="/admin/customers"
            icon={<Users />}
            label="Zákazníci"
            active={pathname?.startsWith('/admin/customers')}
          />
          <NavItem
            href="/admin/orders"
            icon={<ShoppingCart />}
            label="Objednávky"
            active={pathname?.startsWith('/admin/orders')}
          />
          <NavItem
            href="/admin/invoices"
            icon={<FileText />}
            label="Faktury"
            active={pathname?.startsWith('/admin/invoices')}
          />
          <NavItem
            href="/admin/entertainers"
            icon={<Sparkles />}
            label="Animátoři"
            active={pathname?.startsWith('/admin/entertainers')}
          />

          <div className="pt-6 pb-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3">
              Nastavení
            </p>
          </div>

          <NavItem
            href="/admin/settings"
            icon={<Settings />}
            label="Nastavení"
            active={pathname?.startsWith('/admin/settings')}
          />
          <button
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            className="flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-gray-600 hover:bg-gray-50 w-full"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Odhlásit se</span>
          </button>
        </nav>

        {/* Quick Stats Card */}
        <div className="m-4 p-4 bg-gradient-to-br from-partypal-pink-500 to-partypal-yellow-500 rounded-xl text-white">
          <h3 className="font-semibold mb-2">Měsíční statistiky</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-partypal-pink-100">Oslavy</span>
              <span className="font-bold">12</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-partypal-pink-100">Tržby</span>
              <span className="font-bold">45 000 Kč</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:pl-64 pt-16">
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}

function NavItem({
  href,
  icon,
  label,
  active = false,
}: {
  href: string
  icon: React.ReactNode
  label: string
  active?: boolean
}) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors',
        active
          ? 'bg-partypal-pink-50 text-partypal-pink-600'
          : 'text-gray-600 hover:bg-gray-50'
      )}
    >
      <span className="w-5 h-5">{icon}</span>
      <span className="font-medium">{label}</span>
    </Link>
  )
}
