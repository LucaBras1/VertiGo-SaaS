'use client'

import { useState, useEffect } from 'react'
import { Bell, X } from 'lucide-react'

interface PushPromptProps {
  onClose?: () => void
}

export function PushPrompt({ onClose }: PushPromptProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if notifications are supported
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      return
    }

    setPermission(Notification.permission)

    // Show prompt if permission hasn't been requested yet
    if (Notification.permission === 'default') {
      // Delay showing the prompt
      const timer = setTimeout(() => setIsVisible(true), 3000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleEnable = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Request notification permission
      const permission = await Notification.requestPermission()
      setPermission(permission)

      if (permission !== 'granted') {
        setError('Notifikace byly zamítnuty')
        return
      }

      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready

      // Get VAPID public key
      const response = await fetch('/api/notifications/subscribe')
      if (!response.ok) {
        throw new Error('Failed to get VAPID key')
      }

      const { vapidPublicKey } = await response.json()

      if (!vapidPublicKey) {
        throw new Error('VAPID key not available')
      }

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
      })

      // Send subscription to server
      const subscribeResponse = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          deviceName: getDeviceName(),
        }),
      })

      if (!subscribeResponse.ok) {
        throw new Error('Failed to register subscription')
      }

      setIsVisible(false)
      onClose?.()
    } catch (err) {
      console.error('Error enabling notifications:', err)
      setError(err instanceof Error ? err.message : 'Nepodařilo se povolit notifikace')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDismiss = () => {
    setIsVisible(false)
    onClose?.()
    // Store dismissal in localStorage to not show again for a while
    localStorage.setItem('pushPromptDismissed', Date.now().toString())
  }

  if (!isVisible || permission !== 'default') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 max-w-sm bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
          <Bell className="w-5 h-5 text-green-600" />
        </div>

        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">Povolit notifikace?</h3>
          <p className="text-sm text-gray-600 mt-1">
            Budeme vás informovat o nadcházejících trénincích a důležitých aktualizacích.
          </p>

          {error && (
            <p className="text-sm text-red-600 mt-2">{error}</p>
          )}

          <div className="flex gap-2 mt-3">
            <button
              onClick={handleEnable}
              disabled={isLoading}
              className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {isLoading ? 'Povolování...' : 'Povolit'}
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-2 text-gray-600 text-sm font-medium hover:text-gray-800"
            >
              Později
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }

  return outputArray
}

// Helper function to get device name
function getDeviceName(): string {
  const ua = navigator.userAgent
  if (ua.includes('Windows')) return 'Windows PC'
  if (ua.includes('Mac')) return 'Mac'
  if (ua.includes('iPhone')) return 'iPhone'
  if (ua.includes('iPad')) return 'iPad'
  if (ua.includes('Android')) return 'Android'
  if (ua.includes('Linux')) return 'Linux'
  return 'Unknown Device'
}
