'use client'

import { signOut, useSession } from 'next-auth/react'
import { User, Settings, LogOut, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuItems,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from '@vertigo/ui'

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
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors">
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
      </DropdownMenuTrigger>

      <DropdownMenuItems align="end" className="w-56 divide-y divide-gray-100">
        <DropdownMenuLabel>
          <p className="text-sm font-medium text-gray-900">{session.user.name}</p>
          <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
          <p className="text-xs text-primary-600 mt-1">{session.user.tenantName}</p>
        </DropdownMenuLabel>

        <DropdownMenuGroup>
          <DropdownMenuItem>
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
          </DropdownMenuItem>
          <DropdownMenuItem>
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
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuGroup>
          <DropdownMenuItem>
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
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuItems>
    </DropdownMenu>
  )
}
