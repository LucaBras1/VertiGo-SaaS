'use client'

/**
 * Theme Toggle Component
 *
 * Toggle button for switching between light and dark mode in admin panel.
 */

import { Sun, Moon } from 'lucide-react'
import { useAdminUIStore } from '@/stores/adminUIStore'
import { cn } from '@/lib/utils'

interface ThemeToggleProps {
  collapsed?: boolean
}

export function ThemeToggle({ collapsed = false }: ThemeToggleProps) {
  const { darkMode, toggleDarkMode } = useAdminUIStore()

  return (
    <button
      onClick={toggleDarkMode}
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-md transition-colors',
        darkMode
          ? 'text-yellow-400 hover:bg-neutral-gray-700'
          : 'text-gray-600 hover:bg-gray-100',
        collapsed && 'justify-center'
      )}
      title={collapsed ? (darkMode ? 'Světlý režim' : 'Tmavý režim') : undefined}
      aria-label={darkMode ? 'Přepnout na světlý režim' : 'Přepnout na tmavý režim'}
    >
      {darkMode ? (
        <Sun className="h-5 w-5 flex-shrink-0" />
      ) : (
        <Moon className="h-5 w-5 flex-shrink-0" />
      )}
      {!collapsed && (
        <span className="text-sm min-w-0 truncate">
          {darkMode ? 'Světlý režim' : 'Tmavý režim'}
        </span>
      )}
    </button>
  )
}
