'use client'

import { useEffect } from 'react'
import { initInstallPrompt, registerServiceWorker } from '@/lib/pwa/install-prompt'
import { InstallPrompt, UpdateAvailableBanner } from '@/components/pwa/InstallPrompt'

interface PWAProviderProps {
  children: React.ReactNode
}

export function PWAProvider({ children }: PWAProviderProps) {
  useEffect(() => {
    // Initialize PWA install prompt
    initInstallPrompt()

    // Register service worker
    registerServiceWorker().then((registration) => {
      if (registration) {
        console.log('[PWA] Service worker registered')

        // Request to cache important pages after registration
        if (registration.active) {
          registration.active.postMessage({ type: 'CACHE_PAGES' })
        }
      }
    })

    // Handle service worker messages
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'NOTIFICATION_CLICK') {
        // Navigate to the URL from notification
        window.location.href = event.data.url
      }
    }

    navigator.serviceWorker?.addEventListener('message', handleMessage)

    return () => {
      navigator.serviceWorker?.removeEventListener('message', handleMessage)
    }
  }, [])

  return (
    <>
      {children}
      <UpdateAvailableBanner />
      <InstallPrompt variant="banner" />
    </>
  )
}
