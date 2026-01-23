'use client'

import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { signOut, useSession } from 'next-auth/react'
import { User, Settings, LogOut, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export function UserMenu() {
  const { data: session } = useSession()

  if (!session?.user) return null

  const initials = session.user.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U'

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors">
        <div className="w-9 h-9 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-medium text-sm">
          {session.user.image ? (
            <img
              src={session.user.image}
              alt={session.user.name || ''}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            initials
          )}
        </div>
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-gray-900">{session.user.name}</p>
          <p className="text-xs text-gray-500">{session.user.tenantName}</p>
        </div>
        <ChevronDown className="hidden md:block h-4 w-4 text-gray-400" />
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none divide-y divide-gray-100">
          <div className="p-3">
            <p className="text-sm font-medium text-gray-900">{session.user.name}</p>
            <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
            <p className="text-xs text-primary-600 mt-1">{session.user.tenantName}</p>
          </div>

          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <Link
                  href="/dashboard/profile"
                  className={cn(
                    'flex items-center gap-3 px-4 py-2 text-sm',
                    active ? 'bg-gray-50 text-gray-900' : 'text-gray-700'
                  )}
                >
                  <User className="h-4 w-4" />
                  Můj profil
                </Link>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <Link
                  href="/dashboard/settings"
                  className={cn(
                    'flex items-center gap-3 px-4 py-2 text-sm',
                    active ? 'bg-gray-50 text-gray-900' : 'text-gray-700'
                  )}
                >
                  <Settings className="h-4 w-4" />
                  Nastavení
                </Link>
              )}
            </Menu.Item>
          </div>

          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2 text-sm w-full',
                    active ? 'bg-red-50 text-red-700' : 'text-red-600'
                  )}
                >
                  <LogOut className="h-4 w-4" />
                  Odhlásit se
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}
