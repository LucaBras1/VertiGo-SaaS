'use client'

/**
 * Appearance Settings Page
 *
 * Settings for admin panel theme (light/dark mode)
 */

import { useAdminUIStore } from '@/stores/adminUIStore'
import { Sun, Moon, Monitor } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export default function AppearanceSettingsPage() {
  const { darkMode, setDarkMode } = useAdminUIStore()

  const themes = [
    {
      id: 'light',
      name: 'Světlý',
      description: 'Klasický světlý vzhled pro denní použití',
      icon: Sun,
      isActive: !darkMode,
      onClick: () => setDarkMode(false),
    },
    {
      id: 'dark',
      name: 'Tmavý',
      description: 'Tmavý režim šetří oči při práci v noci',
      icon: Moon,
      isActive: darkMode,
      onClick: () => setDarkMode(true),
    },
  ]

  return (
    <div className="px-4 py-8 sm:px-0">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <ol className="flex items-center space-x-2 text-sm">
          <li>
            <Link href="/admin/settings" className={cn(
              'hover:underline',
              darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
            )}>
              Nastavení
            </Link>
          </li>
          <li className={darkMode ? 'text-gray-600' : 'text-gray-400'}>/</li>
          <li className={darkMode ? 'text-gray-200' : 'text-gray-900'}>Vzhled</li>
        </ol>
      </nav>

      <div className="mb-8">
        <h1 className={cn(
          'text-3xl font-bold',
          darkMode ? 'text-gray-100' : 'text-gray-900'
        )}>Vzhled</h1>
        <p className={cn(
          'mt-2 text-sm',
          darkMode ? 'text-gray-400' : 'text-gray-600'
        )}>
          Nastavení vzhledu admin panelu
        </p>
      </div>

      {/* Theme Selection */}
      <div className={cn(
        'rounded-lg shadow border p-6',
        darkMode
          ? 'bg-neutral-gray-800 border-neutral-gray-700'
          : 'bg-white border-gray-200'
      )}>
        <h2 className={cn(
          'text-lg font-semibold mb-4',
          darkMode ? 'text-gray-100' : 'text-gray-900'
        )}>
          Barevné schéma
        </h2>
        <p className={cn(
          'text-sm mb-6',
          darkMode ? 'text-gray-400' : 'text-gray-600'
        )}>
          Vyberte preferovaný vzhled administrace
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {themes.map((theme) => {
            const Icon = theme.icon
            return (
              <button
                key={theme.id}
                onClick={theme.onClick}
                className={cn(
                  'flex items-start gap-4 p-4 rounded-lg border-2 transition-all text-left',
                  theme.isActive
                    ? darkMode
                      ? 'border-blue-500 bg-blue-900/20'
                      : 'border-blue-500 bg-blue-50'
                    : darkMode
                      ? 'border-neutral-gray-600 hover:border-neutral-gray-500 bg-neutral-gray-700/50'
                      : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                )}
              >
                <div className={cn(
                  'w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0',
                  theme.isActive
                    ? 'bg-blue-100 text-blue-600'
                    : darkMode
                      ? 'bg-neutral-gray-600 text-gray-300'
                      : 'bg-gray-200 text-gray-600'
                )}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className={cn(
                      'font-semibold',
                      darkMode ? 'text-gray-100' : 'text-gray-900'
                    )}>
                      {theme.name}
                    </h3>
                    {theme.isActive && (
                      <span className={cn(
                        'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                        darkMode
                          ? 'bg-blue-900/50 text-blue-400'
                          : 'bg-blue-100 text-blue-700'
                      )}>
                        Aktivní
                      </span>
                    )}
                  </div>
                  <p className={cn(
                    'text-sm mt-1',
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  )}>
                    {theme.description}
                  </p>
                </div>
              </button>
            )
          })}
        </div>

        {/* Preview */}
        <div className={cn(
          'mt-8 p-4 rounded-lg border',
          darkMode
            ? 'bg-neutral-gray-900 border-neutral-gray-700'
            : 'bg-gray-100 border-gray-200'
        )}>
          <h3 className={cn(
            'text-sm font-medium mb-3',
            darkMode ? 'text-gray-300' : 'text-gray-700'
          )}>
            Náhled
          </h3>
          <div className={cn(
            'rounded-lg p-4 border',
            darkMode
              ? 'bg-neutral-gray-800 border-neutral-gray-600'
              : 'bg-white border-gray-200'
          )}>
            <div className="flex items-center gap-3 mb-3">
              <div className={cn(
                'w-8 h-8 rounded-full',
                darkMode ? 'bg-blue-900/50' : 'bg-blue-100'
              )} />
              <div className="flex-1">
                <div className={cn(
                  'h-3 w-24 rounded',
                  darkMode ? 'bg-neutral-gray-600' : 'bg-gray-200'
                )} />
                <div className={cn(
                  'h-2 w-16 rounded mt-1.5',
                  darkMode ? 'bg-neutral-gray-700' : 'bg-gray-100'
                )} />
              </div>
            </div>
            <div className={cn(
              'h-2 w-full rounded mb-2',
              darkMode ? 'bg-neutral-gray-700' : 'bg-gray-100'
            )} />
            <div className={cn(
              'h-2 w-3/4 rounded',
              darkMode ? 'bg-neutral-gray-700' : 'bg-gray-100'
            )} />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className={cn(
        'mt-6 p-4 rounded-lg border',
        darkMode
          ? 'bg-blue-900/20 border-blue-800 text-blue-300'
          : 'bg-blue-50 border-blue-200 text-blue-700'
      )}>
        <p className="text-sm">
          Nastavení vzhledu se ukládá lokálně v prohlížeči a bude zachováno i po odhlášení.
        </p>
      </div>
    </div>
  )
}
