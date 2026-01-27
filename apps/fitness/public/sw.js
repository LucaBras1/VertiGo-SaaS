/**
 * Service Worker for FitAdmin
 *
 * Handles:
 * - Push notifications
 * - Offline caching (app shell, pages, API responses)
 * - Background sync
 */

// Service Worker version for cache busting
const SW_VERSION = '2.0.0'

// Cache names
const CACHE_STATIC = `fitadmin-static-v${SW_VERSION}`
const CACHE_PAGES = `fitadmin-pages-v1`
const CACHE_API = `fitadmin-api-v1`
const CACHE_IMAGES = `fitadmin-images-v1`

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
]

// Pages to cache for offline access
const CACHED_PAGES = [
  '/dashboard',
  '/dashboard/clients',
  '/dashboard/sessions',
  '/dashboard/invoices',
]

// API endpoints to cache
const CACHED_API_PATTERNS = [
  /\/api\/clients$/,
  /\/api\/sessions$/,
  /\/api\/packages$/,
]

// Cache duration in milliseconds
const CACHE_DURATION = {
  api: 5 * 60 * 1000, // 5 minutes
  pages: 60 * 60 * 1000, // 1 hour
}

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Install, version:', SW_VERSION)

  event.waitUntil(
    caches.open(CACHE_STATIC).then((cache) => {
      console.log('[ServiceWorker] Caching static assets')
      return cache.addAll(STATIC_ASSETS)
    })
  )

  // Activate immediately
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activate')

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            // Delete old static caches
            return cacheName.startsWith('fitadmin-static-') && cacheName !== CACHE_STATIC
          })
          .map((cacheName) => {
            console.log('[ServiceWorker] Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          })
      )
    })
  )

  // Take control of all pages immediately
  event.waitUntil(self.clients.claim())
})

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return
  }

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return
  }

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(event.request))
    return
  }

  // Handle page navigation
  if (event.request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(event.request))
    return
  }

  // Handle static assets and images
  if (isStaticAsset(url.pathname)) {
    event.respondWith(handleStaticRequest(event.request))
    return
  }

  // Handle images
  if (isImage(url.pathname)) {
    event.respondWith(handleImageRequest(event.request))
    return
  }

  // Default: network first
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  )
})

// Handle API requests - stale-while-revalidate strategy
async function handleApiRequest(request) {
  const url = new URL(request.url)

  // Check if this API should be cached
  const shouldCache = CACHED_API_PATTERNS.some((pattern) => pattern.test(url.pathname))

  if (!shouldCache) {
    return fetch(request)
  }

  const cache = await caches.open(CACHE_API)
  const cachedResponse = await cache.match(request)

  // Return cached response immediately if available
  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        // Clone and cache the response
        const responseToCache = networkResponse.clone()
        cache.put(request, responseToCache)
      }
      return networkResponse
    })
    .catch((error) => {
      console.log('[ServiceWorker] API fetch failed:', error)
      if (cachedResponse) {
        return cachedResponse
      }
      throw error
    })

  // Return cached response first, then update in background
  return cachedResponse || fetchPromise
}

// Handle navigation requests - network first with offline fallback
async function handleNavigationRequest(request) {
  const url = new URL(request.url)

  try {
    // Try network first
    const networkResponse = await fetch(request)

    // Cache successful responses for dashboard pages
    if (networkResponse.ok && url.pathname.startsWith('/dashboard')) {
      const cache = await caches.open(CACHE_PAGES)
      cache.put(request, networkResponse.clone())
    }

    return networkResponse
  } catch (error) {
    console.log('[ServiceWorker] Navigation fetch failed:', error)

    // Try to serve from cache
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    // Serve offline page
    const offlineResponse = await caches.match('/offline.html')
    if (offlineResponse) {
      return offlineResponse
    }

    // Last resort: return a basic error response
    return new Response('Offline', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'text/plain' },
    })
  }
}

// Handle static assets - cache first
async function handleStaticRequest(request) {
  const cachedResponse = await caches.match(request)
  if (cachedResponse) {
    return cachedResponse
  }

  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_STATIC)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    console.log('[ServiceWorker] Static fetch failed:', error)
    throw error
  }
}

// Handle image requests - cache first with network fallback
async function handleImageRequest(request) {
  const cachedResponse = await caches.match(request)
  if (cachedResponse) {
    return cachedResponse
  }

  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_IMAGES)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    console.log('[ServiceWorker] Image fetch failed:', error)
    // Return a placeholder image or transparent pixel
    return new Response(
      'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      { headers: { 'Content-Type': 'image/gif' } }
    )
  }
}

// Helper: check if path is a static asset
function isStaticAsset(pathname) {
  return (
    pathname.startsWith('/_next/static/') ||
    pathname.endsWith('.js') ||
    pathname.endsWith('.css') ||
    pathname.endsWith('.woff2') ||
    pathname.endsWith('.woff')
  )
}

// Helper: check if path is an image
function isImage(pathname) {
  return (
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.jpeg') ||
    pathname.endsWith('.gif') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.webp') ||
    pathname.endsWith('.ico')
  )
}

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
      body: event.data.text() || 'Nova notifikace',
    }
  }

  const options = {
    body: data.body || 'Nova notifikace',
    icon: data.icon || '/icons/icon-192x192.png',
    badge: data.badge || '/icons/badge-icon.png',
    vibrate: [100, 50, 100],
    data: data.data || {},
    tag: data.tag,
    requireInteraction: data.requireInteraction || false,
    actions: data.actions || [
      { action: 'open', title: 'Otevrit' },
      { action: 'dismiss', title: 'Zavrit' },
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
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
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

  // Precache pages on demand
  if (event.data?.type === 'CACHE_PAGES') {
    event.waitUntil(
      caches.open(CACHE_PAGES).then((cache) => {
        return Promise.all(
          CACHED_PAGES.map((page) =>
            cache.add(page).catch((err) => console.log('[ServiceWorker] Failed to cache:', page, err))
          )
        )
      })
    )
  }

  // Clear specific cache
  if (event.data?.type === 'CLEAR_CACHE') {
    const cacheName = event.data.cacheName
    if (cacheName) {
      event.waitUntil(caches.delete(cacheName))
    }
  }
})

// Background sync event
self.addEventListener('sync', (event) => {
  console.log('[ServiceWorker] Sync event:', event.tag)

  if (event.tag === 'sync-sessions') {
    event.waitUntil(syncSessions())
  }

  if (event.tag === 'sync-notifications') {
    event.waitUntil(Promise.resolve())
  }
})

// Sync offline sessions
async function syncSessions() {
  try {
    // Get pending sessions from IndexedDB
    // This would need IndexedDB implementation
    console.log('[ServiceWorker] Syncing sessions...')
    return Promise.resolve()
  } catch (error) {
    console.error('[ServiceWorker] Sync failed:', error)
    throw error
  }
}

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  console.log('[ServiceWorker] Periodic sync:', event.tag)

  if (event.tag === 'update-dashboard') {
    event.waitUntil(updateDashboardCache())
  }
})

// Update dashboard cache
async function updateDashboardCache() {
  try {
    const cache = await caches.open(CACHE_API)

    // Refresh key API endpoints
    const endpoints = ['/api/clients', '/api/sessions', '/api/invoices']

    await Promise.all(
      endpoints.map(async (endpoint) => {
        try {
          const response = await fetch(endpoint)
          if (response.ok) {
            await cache.put(endpoint, response)
          }
        } catch (error) {
          console.log('[ServiceWorker] Failed to update cache for:', endpoint)
        }
      })
    )
  } catch (error) {
    console.error('[ServiceWorker] Dashboard cache update failed:', error)
  }
}
