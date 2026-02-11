'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { SlideOver, SlideOverPanel, SlideOverTitle } from '@vertigo/ui'
import {
  X,
  Bell,
  Calendar,
  FileText,
  CreditCard,
  AlertTriangle,
  Check,
  CheckCheck,
  Loader2,
  Trash2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { cs } from 'date-fns/locale'

interface Notification {
  id: string
  type: string
  title: string
  body: string
  data?: {
    url?: string
    type?: string
    entityId?: string
  }
  status: string
  sentAt?: string
  createdAt: string
}

interface NotificationsPanelProps {
  isOpen: boolean
  onClose: () => void
}

const typeIcons = {
  session_reminder: Calendar,
  class_reminder: Calendar,
  invoice: FileText,
  payment: CreditCard,
  at_risk: AlertTriangle,
  general: Bell,
}

const typeColors = {
  session_reminder: 'bg-green-100 text-green-600',
  class_reminder: 'bg-purple-100 text-purple-600',
  invoice: 'bg-orange-100 text-orange-600',
  payment: 'bg-blue-100 text-blue-600',
  at_risk: 'bg-red-100 text-red-600',
  general: 'bg-gray-100 text-gray-600',
}

export function NotificationsPanel({ isOpen, onClose }: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const router = useRouter()

  const fetchNotifications = useCallback(async (offset = 0) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/notifications?limit=20&offset=${offset}`)
      if (response.ok) {
        const data = await response.json()
        if (offset === 0) {
          setNotifications(data.notifications)
        } else {
          setNotifications(prev => [...prev, ...data.notifications])
        }
        setUnreadCount(data.unreadCount)
        setHasMore(data.hasMore)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      fetchNotifications()
    }
  }, [isOpen, fetchNotifications])

  const markAsRead = async (ids: string[]) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      })
      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => (ids.includes(n.id) ? { ...n, status: 'read' } : n))
        )
        setUnreadCount(prev => Math.max(0, prev - ids.length))
      }
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      })
      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, status: 'read' })))
        setUnreadCount(0)
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (notification.status !== 'read') {
      markAsRead([notification.id])
    }

    // Navigate if URL is provided
    if (notification.data?.url) {
      router.push(notification.data.url)
      onClose()
    }
  }

  const getIcon = (type: string) => {
    return typeIcons[type as keyof typeof typeIcons] || Bell
  }

  const getColor = (type: string) => {
    return typeColors[type as keyof typeof typeColors] || typeColors.general
  }

  return (
    <SlideOver open={isOpen} onClose={onClose}>
      <SlideOverPanel className="max-w-md">
        <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-4">
            <div className="flex items-center justify-between">
              <SlideOverTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifikace
                {unreadCount > 0 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    {unreadCount}
                  </span>
                )}
              </SlideOverTitle>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                  >
                    <CheckCheck className="h-4 w-4" />
                    Vše přečteno
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-500 rounded-lg hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Notifications list */}
          <div className="flex-1 overflow-y-auto">
            {isLoading && notifications.length === 0 ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                <Bell className="h-12 w-12 mb-2 opacity-50" />
                <p>Žádné notifikace</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {notifications.map((notification) => {
                  const Icon = getIcon(notification.type)
                  const colorClass = getColor(notification.type)
                  const isUnread = notification.status !== 'read'

                  return (
                    <li
                      key={notification.id}
                      className={cn(
                        'relative hover:bg-gray-50 transition-colors cursor-pointer',
                        isUnread && 'bg-blue-50/50'
                      )}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="px-4 py-4">
                        <div className="flex items-start gap-3">
                          <div
                            className={cn(
                              'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
                              colorClass
                            )}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p
                                className={cn(
                                  'text-sm font-medium text-gray-900 truncate',
                                  isUnread && 'font-semibold'
                                )}
                              >
                                {notification.title}
                              </p>
                              {isUnread && (
                                <span className="flex-shrink-0 w-2 h-2 bg-primary-500 rounded-full" />
                              )}
                            </div>
                            <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                              {notification.body}
                            </p>
                            <p className="mt-1 text-xs text-gray-400">
                              {formatDistanceToNow(new Date(notification.createdAt), {
                                addSuffix: true,
                                locale: cs,
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}

            {/* Load more */}
            {hasMore && (
              <div className="p-4 text-center">
                <button
                  onClick={() => fetchNotifications(notifications.length)}
                  disabled={isLoading}
                  className="text-sm text-primary-600 hover:text-primary-700 disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                  ) : (
                    'Načíst další'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </SlideOverPanel>
    </SlideOver>
  )
}
