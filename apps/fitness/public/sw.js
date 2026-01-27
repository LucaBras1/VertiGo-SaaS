/**
 * Service Worker for FitAdmin Push Notifications
 *
 * Handles background push notifications and notification click events.
 */

// Service Worker version for cache busting
const SW_VERSION = '1.0.0'

// Install event
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Install, version:', SW_VERSION)
  self.skipWaiting()
})

// Activate event
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activate')
  event.waitUntil(self.clients.claim())
})

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('[ServiceWorker] Push received')

  if (!event.data) {
    console.log('[ServiceWorker] No data in push event')
    return
  }

  let data
  try {
    data = event.data.json()
  } catch (e) {
    console.error('[ServiceWorker] Failed to parse push data:', e)
    data = {
      title: 'FitAdmin',
      body: event.data.text() || 'Nová notifikace',
    }
  }

  const options = {
    body: data.body || 'Nová notifikace',
    icon: data.icon || '/icons/notification-icon.png',
    badge: data.badge || '/icons/badge-icon.png',
    vibrate: [100, 50, 100],
    data: data.data || {},
    tag: data.tag,
    requireInteraction: data.requireInteraction || false,
    actions: [
      { action: 'open', title: 'Otevřít' },
      { action: 'dismiss', title: 'Zavřít' },
    ],
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'FitAdmin', options)
  )
})

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('[ServiceWorker] Notification click:', event.action)

  event.notification.close()

  if (event.action === 'dismiss') {
    return
  }

  // Get URL from notification data
  const url = event.notification.data?.url || '/dashboard'

  event.waitUntil(
    // Check if window is already open
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Try to focus existing window
        for (const client of clientList) {
          if (client.url.includes('/dashboard') && 'focus' in client) {
            client.focus()
            client.postMessage({
              type: 'NOTIFICATION_CLICK',
              url: url,
            })
            return
          }
        }

        // Open new window if none found
        if (self.clients.openWindow) {
          return self.clients.openWindow(url)
        }
      })
  )
})

// Notification close event
self.addEventListener('notificationclose', (event) => {
  console.log('[ServiceWorker] Notification closed')
})

// Message event - handle messages from the main thread
self.addEventListener('message', (event) => {
  console.log('[ServiceWorker] Message received:', event.data)

  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

// Background sync event (optional, for future use)
self.addEventListener('sync', (event) => {
  console.log('[ServiceWorker] Sync event:', event.tag)

  if (event.tag === 'sync-notifications') {
    event.waitUntil(
      // Sync pending notifications when back online
      Promise.resolve()
    )
  }
})
