'use client'

import { useState, useEffect } from 'react'
import { X, Download, Smartphone, Monitor, Apple } from 'lucide-react'
import {
  canInstall,
  promptInstall,
  isAppInstalled,
  getInstallInstructions,
} from '@/lib/pwa/install-prompt'
import { cn } from '@/lib/utils'

interface InstallPromptProps {
  variant?: 'banner' | 'modal' | 'inline'
  className?: string
  onDismiss?: () => void
}

export function InstallPrompt({
  variant = 'banner',
  className,
  onDismiss
}: InstallPromptProps) {
  const [showPrompt, setShowPrompt] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)
  const [installing, setInstalling] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Check if already dismissed
    const wasDismissed = localStorage.getItem('pwa-prompt-dismissed')
    if (wasDismissed) {
      const dismissedAt = new Date(wasDismissed)
      const daysSinceDismiss = (Date.now() - dismissedAt.getTime()) / (1000 * 60 * 60 * 24)
      // Show again after 7 days
      if (daysSinceDismiss < 7) {
        setDismissed(true)
        return
      }
    }

    // Check if already installed
    if (isAppInstalled()) {
      return
    }

    // Listen for install availability
    const handleInstallAvailable = () => {
      setShowPrompt(true)
    }

    // Check if can install now
    if (canInstall()) {
      setShowPrompt(true)
    }

    window.addEventListener('pwa-install-available', handleInstallAvailable)
    window.addEventListener('pwa-installed', () => setShowPrompt(false))

    return () => {
      window.removeEventListener('pwa-install-available', handleInstallAvailable)
    }
  }, [])

  const handleInstall = async () => {
    if (!canInstall()) {
      // Show manual instructions for iOS or unsupported browsers
      setShowInstructions(true)
      return
    }

    setInstalling(true)
    const result = await promptInstall()
    setInstalling(false)

    if (result === 'accepted') {
      setShowPrompt(false)
    }
  }

  const handleDismiss = () => {
    localStorage.setItem('pwa-prompt-dismissed', new Date().toISOString())
    setDismissed(true)
    setShowPrompt(false)
    onDismiss?.()
  }

  const instructions = getInstallInstructions()

  if (dismissed || !showPrompt) {
    return null
  }

  // Instructions modal
  if (showInstructions) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {instructions.platform === 'ios' && <Apple className="h-6 w-6 text-gray-700" />}
              {instructions.platform === 'android' && <Smartphone className="h-6 w-6 text-green-600" />}
              {instructions.platform === 'desktop' && <Monitor className="h-6 w-6 text-blue-600" />}
              <h3 className="text-lg font-semibold">Nainstalovat FitAdmin</h3>
            </div>
            <button
              onClick={() => setShowInstructions(false)}
              className="p-1 rounded-md hover:bg-gray-100"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <ol className="space-y-3 mb-6">
            {instructions.instructions.map((instruction, index) => (
              <li key={index} className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </span>
                <span className="text-gray-600">{instruction}</span>
              </li>
            ))}
          </ol>

          <button
            onClick={() => setShowInstructions(false)}
            className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Rozumim
          </button>
        </div>
      </div>
    )
  }

  // Banner variant
  if (variant === 'banner') {
    return (
      <div className={cn(
        'fixed bottom-0 left-0 right-0 z-50 bg-secondary-800 border-t border-secondary-700 p-4 safe-area-pb',
        'animate-slide-up',
        className
      )}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
              <Download className="h-5 w-5 text-primary-400" />
            </div>
            <div>
              <p className="text-white font-medium">Nainstalujte FitAdmin</p>
              <p className="text-sm text-gray-400">Rychlejsi pristup a offline podpora</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDismiss}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Pozdeji
            </button>
            <button
              onClick={handleInstall}
              disabled={installing}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors disabled:opacity-50"
            >
              {installing ? 'Instaluji...' : 'Nainstalovat'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Inline variant
  if (variant === 'inline') {
    return (
      <div className={cn(
        'bg-gradient-to-r from-primary-500/10 to-primary-600/10 border border-primary-500/20 rounded-xl p-4',
        className
      )}>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Smartphone className="h-6 w-6 text-primary-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white mb-1">Pridejte si FitAdmin na plochu</h3>
            <p className="text-sm text-gray-400 mb-3">
              Mete okamzity pristup k aplikaci, push notifikace a offline rezim.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleInstall}
                disabled={installing}
                className="px-4 py-2 bg-primary-500 text-white text-sm rounded-lg font-medium hover:bg-primary-600 transition-colors disabled:opacity-50"
              >
                {installing ? 'Instaluji...' : 'Nainstalovat'}
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2 text-gray-400 text-sm hover:text-white transition-colors"
              >
                Nezobrazovat
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Modal variant
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4">
      <div className={cn(
        'bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-w-md w-full overflow-hidden',
        'animate-slide-up',
        className
      )}>
        <div className="p-6">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center">
              <Download className="h-8 w-8 text-primary-600" />
            </div>
          </div>

          <h2 className="text-xl font-bold text-center mb-2">
            Nainstalujte FitAdmin
          </h2>
          <p className="text-gray-600 text-center mb-6">
            Pridejte si aplikaci na domovskou obrazovku pro rychlejsi pristup a lepsi vykon.
          </p>

          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span>Offline pristup k dulelitym datum</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span>Push notifikace o treninzich</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span>Rychlejsi nacitani aplikace</span>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={handleInstall}
              disabled={installing}
              className="w-full py-3 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50"
            >
              {installing ? 'Instaluji...' : 'Nainstalovat aplikaci'}
            </button>
            <button
              onClick={handleDismiss}
              className="w-full py-3 text-gray-500 font-medium hover:text-gray-700 transition-colors"
            >
              Mozna pozdeji
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Update available banner component
export function UpdateAvailableBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    const handleUpdateAvailable = (e: CustomEvent<{ registration: ServiceWorkerRegistration }>) => {
      setRegistration(e.detail.registration)
      setShowBanner(true)
    }

    window.addEventListener('pwa-update-available', handleUpdateAvailable as EventListener)

    return () => {
      window.removeEventListener('pwa-update-available', handleUpdateAvailable as EventListener)
    }
  }, [])

  const handleUpdate = () => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      window.location.reload()
    }
  }

  if (!showBanner) {
    return null
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-blue-600 text-white p-3 safe-area-pt">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <p className="text-sm">
          Nova verze FitAdmin je k dispozici.
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowBanner(false)}
            className="px-3 py-1 text-sm text-blue-100 hover:text-white"
          >
            Pozdeji
          </button>
          <button
            onClick={handleUpdate}
            className="px-3 py-1 bg-white text-blue-600 text-sm rounded font-medium hover:bg-blue-50"
          >
            Aktualizovat
          </button>
        </div>
      </div>
    </div>
  )
}
