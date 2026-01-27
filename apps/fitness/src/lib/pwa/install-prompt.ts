/**
 * PWA Install Prompt Utilities
 *
 * Handles the beforeinstallprompt event and provides utilities
 * for prompting users to install the PWA.
 */

// Types for the beforeinstallprompt event
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

// Store the deferred prompt
let deferredPrompt: BeforeInstallPromptEvent | null = null

// Store installation state
let isInstalled = false

/**
 * Initialize PWA install prompt listener
 * Call this once on app startup
 */
export function initInstallPrompt(): void {
  if (typeof window === 'undefined') return

  // Check if already installed
  if (window.matchMedia('(display-mode: standalone)').matches) {
    isInstalled = true
    return
  }

  // Listen for the beforeinstallprompt event
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault()
    // Stash the event so it can be triggered later
    deferredPrompt = e as BeforeInstallPromptEvent

    // Dispatch custom event so components can update
    window.dispatchEvent(new CustomEvent('pwa-install-available'))
  })

  // Listen for successful installation
  window.addEventListener('appinstalled', () => {
    isInstalled = true
    deferredPrompt = null

    // Track installation
    if (typeof gtag !== 'undefined') {
      gtag('event', 'pwa_install', {
        event_category: 'PWA',
        event_label: 'FitAdmin installed',
      })
    }

    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('pwa-installed'))
  })
}

/**
 * Check if PWA installation is available
 */
export function canInstall(): boolean {
  return deferredPrompt !== null && !isInstalled
}

/**
 * Check if app is already installed
 */
export function isAppInstalled(): boolean {
  if (typeof window === 'undefined') return false

  // Check display-mode
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return true
  }

  // Check iOS standalone
  if ((navigator as unknown as { standalone?: boolean }).standalone === true) {
    return true
  }

  return isInstalled
}

/**
 * Prompt the user to install the PWA
 * Returns the user's choice
 */
export async function promptInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
  if (!deferredPrompt) {
    return 'unavailable'
  }

  // Show the install prompt
  deferredPrompt.prompt()

  // Wait for the user to respond
  const { outcome } = await deferredPrompt.userChoice

  // Clear the deferred prompt - it can only be used once
  deferredPrompt = null

  return outcome
}

/**
 * Get platform-specific install instructions
 */
export function getInstallInstructions(): {
  platform: 'ios' | 'android' | 'desktop' | 'unknown'
  instructions: string[]
} {
  if (typeof window === 'undefined') {
    return { platform: 'unknown', instructions: [] }
  }

  const userAgent = navigator.userAgent.toLowerCase()

  // iOS Safari
  if (/iphone|ipad|ipod/.test(userAgent) && !/crios|fxios/.test(userAgent)) {
    return {
      platform: 'ios',
      instructions: [
        'Klepnete na tlacitko Sdileni (ctverecek se sipkou)',
        'Scrollujte dolu a klepnete na "Pridat na plochu"',
        'Klepnete na "Pridat" v pravem hornim rohu',
      ],
    }
  }

  // Android
  if (/android/.test(userAgent)) {
    return {
      platform: 'android',
      instructions: [
        'Klepnete na tri tecky v pravem hornim rohu',
        'Vyberte "Pridat na plochu" nebo "Nainstalovat aplikaci"',
        'Potvrdte instalaci',
      ],
    }
  }

  // Desktop
  return {
    platform: 'desktop',
    instructions: [
      'Kliknete na ikonu instalace v adresnim radku',
      'Nebo kliknete na tlacitko "Nainstalovat" nize',
    ],
  }
}

/**
 * Register service worker
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    })

    // Check for updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing
      if (!newWorker) return

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New content is available, dispatch event
          window.dispatchEvent(new CustomEvent('pwa-update-available', {
            detail: { registration },
          }))
        }
      })
    })

    return registration
  } catch (error) {
    console.error('Service worker registration failed:', error)
    return null
  }
}

/**
 * Skip waiting and activate new service worker
 */
export function activateUpdate(registration: ServiceWorkerRegistration): void {
  const waiting = registration.waiting
  if (waiting) {
    waiting.postMessage({ type: 'SKIP_WAITING' })
  }
}

// Declare gtag for TypeScript
declare const gtag: (command: string, action: string, params: Record<string, string>) => void
