/**
 * Admin UI State Store
 *
 * Zustand store for admin UI state management
 * - Sidebar collapse state
 * - Global search modal
 * - Command palette modal
 * - Recent items tracking
 * - Notifications
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface RecentItem {
  id: string
  type: 'performance' | 'game' | 'service' | 'post' | 'event' | 'team' | 'page' | 'order' | 'customer'
  title: string
  url: string
  timestamp: number
}

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  timestamp: number
  read: boolean
}

interface AdminUIState {
  // Sidebar
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void

  // Dark Mode
  darkMode: boolean
  toggleDarkMode: () => void
  setDarkMode: (enabled: boolean) => void

  // Modals
  searchModalOpen: boolean
  commandPaletteOpen: boolean
  setSearchModalOpen: (open: boolean) => void
  setCommandPaletteOpen: (open: boolean) => void

  // Recent Items
  recentItems: RecentItem[]
  addRecentItem: (item: Omit<RecentItem, 'timestamp'>) => void
  clearRecentItems: () => void

  // Notifications
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
  markNotificationRead: (id: string) => void
  clearNotifications: () => void
  unreadCount: number
}

export const useAdminUIStore = create<AdminUIState>()(
  persist(
    (set, get) => ({
      // Sidebar
      sidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

      // Dark Mode
      darkMode: false,
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      setDarkMode: (enabled) => set({ darkMode: enabled }),

      // Modals
      searchModalOpen: false,
      commandPaletteOpen: false,
      setSearchModalOpen: (open) => set({ searchModalOpen: open }),
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

      // Recent Items
      recentItems: [],
      addRecentItem: (item) => {
        const currentItems = get().recentItems
        // Remove duplicate if exists
        const filteredItems = currentItems.filter((i) => i.id !== item.id || i.type !== item.type)
        // Add new item at the beginning
        const newItems = [
          { ...item, timestamp: Date.now() },
          ...filteredItems,
        ].slice(0, 10) // Keep only last 10 items
        set({ recentItems: newItems })
      },
      clearRecentItems: () => set({ recentItems: [] }),

      // Notifications
      notifications: [],
      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: `notif-${Date.now()}-${Math.random()}`,
          timestamp: Date.now(),
          read: false,
        }
        set((state) => ({
          notifications: [newNotification, ...state.notifications].slice(0, 50), // Keep last 50
        }))
      },
      markNotificationRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        }))
      },
      clearNotifications: () => set({ notifications: [] }),
      unreadCount: 0,
    }),
    {
      name: 'admin-ui-storage',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        darkMode: state.darkMode,
        recentItems: state.recentItems,
      }),
    }
  )
)

// Selector hooks for better performance
export const useSidebarCollapsed = () => useAdminUIStore((state) => state.sidebarCollapsed)
export const useDarkMode = () => useAdminUIStore((state) => ({
  darkMode: state.darkMode,
  toggle: state.toggleDarkMode,
  setDarkMode: state.setDarkMode,
}))
export const useSearchModal = () => useAdminUIStore((state) => ({
  isOpen: state.searchModalOpen,
  setOpen: state.setSearchModalOpen,
}))
export const useCommandPalette = () => useAdminUIStore((state) => ({
  isOpen: state.commandPaletteOpen,
  setOpen: state.setCommandPaletteOpen,
}))
export const useRecentItems = () => useAdminUIStore((state) => state.recentItems)
export const useNotifications = () => useAdminUIStore((state) => ({
  notifications: state.notifications,
  unreadCount: state.notifications.filter((n) => !n.read).length,
  addNotification: state.addNotification,
  markRead: state.markNotificationRead,
  clear: state.clearNotifications,
}))
