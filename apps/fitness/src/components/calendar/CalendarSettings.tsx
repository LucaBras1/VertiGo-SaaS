'use client'

import { useState, useEffect } from 'react'
import { Calendar, Link2, Unlink, Copy, Check, RefreshCw, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface GoogleIntegration {
  calendarEmail: string | null
  syncEnabled: boolean
  syncDirection: string
  lastSyncAt: string | null
  connectedAt: string
}

interface CalendarStatus {
  configured: boolean
  connected: boolean
  integration: GoogleIntegration | null
}

export function CalendarSettings() {
  const [googleStatus, setGoogleStatus] = useState<CalendarStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)

  const [feedUrl, setFeedUrl] = useState<string | null>(null)
  const [isGeneratingFeed, setIsGeneratingFeed] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  useEffect(() => {
    loadStatus()
  }, [])

  const loadStatus = async () => {
    try {
      const response = await fetch('/api/calendar/google/status')
      if (response.ok) {
        const data = await response.json()
        setGoogleStatus(data)
      }
    } catch (error) {
      console.error('Failed to load calendar status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const connectGoogle = async () => {
    setIsConnecting(true)
    try {
      const response = await fetch('/api/calendar/google/auth')
      if (!response.ok) {
        throw new Error('Failed to get auth URL')
      }

      const { authUrl } = await response.json()
      window.location.href = authUrl
    } catch (error) {
      console.error('Failed to connect Google:', error)
      toast.error('Nepodařilo se připojit Google Kalendář')
      setIsConnecting(false)
    }
  }

  const disconnectGoogle = async () => {
    setIsDisconnecting(true)
    try {
      const response = await fetch('/api/calendar/google/disconnect', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to disconnect')
      }

      setGoogleStatus(prev => prev ? { ...prev, connected: false, integration: null } : null)
      toast.success('Google Kalendář odpojen')
    } catch (error) {
      console.error('Failed to disconnect Google:', error)
      toast.error('Nepodařilo se odpojit Google Kalendář')
    } finally {
      setIsDisconnecting(false)
    }
  }

  const generateFeed = async () => {
    setIsGeneratingFeed(true)
    try {
      const response = await fetch('/api/calendar/feed/generate', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to generate feed')
      }

      const { feedUrl } = await response.json()
      setFeedUrl(feedUrl)
      toast.success('ICS feed URL vygenerováno')
    } catch (error) {
      console.error('Failed to generate feed:', error)
      toast.error('Nepodařilo se vygenerovat feed URL')
    } finally {
      setIsGeneratingFeed(false)
    }
  }

  const revokeFeed = async () => {
    try {
      const response = await fetch('/api/calendar/feed/generate', {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to revoke feed')
      }

      setFeedUrl(null)
      toast.success('ICS feed URL zrušeno')
    } catch (error) {
      console.error('Failed to revoke feed:', error)
      toast.error('Nepodařilo se zrušit feed URL')
    }
  }

  const copyFeedUrl = async () => {
    if (!feedUrl) return

    try {
      await navigator.clipboard.writeText(feedUrl)
      setIsCopied(true)
      toast.success('URL zkopírováno')
      setTimeout(() => setIsCopied(false), 2000)
    } catch (error) {
      toast.error('Nepodařilo se zkopírovat URL')
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Nikdy'
    return new Date(dateString).toLocaleDateString('cs-CZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-green-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Google Calendar */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Google Kalendář</h3>
            <p className="text-sm text-gray-500">
              Synchronizujte tréninky a lekce s Google Kalendářem
            </p>
          </div>
        </div>

        {!googleStatus?.configured ? (
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">
              Google Kalendář není nakonfigurován. Kontaktujte administrátora.
            </p>
          </div>
        ) : googleStatus.connected && googleStatus.integration ? (
          <div className="space-y-4">
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-700 mb-2">
                <Check className="w-4 h-4" />
                <span className="font-medium">Připojeno</span>
              </div>
              <p className="text-sm text-green-600">
                {googleStatus.integration.calendarEmail || 'Google účet připojen'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Připojeno:</span>
                <span className="ml-2 text-gray-900">
                  {formatDate(googleStatus.integration.connectedAt)}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Poslední sync:</span>
                <span className="ml-2 text-gray-900">
                  {formatDate(googleStatus.integration.lastSyncAt)}
                </span>
              </div>
            </div>

            <button
              onClick={disconnectGoogle}
              disabled={isDisconnecting}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 text-sm font-medium"
            >
              {isDisconnecting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Unlink className="w-4 h-4" />
              )}
              Odpojit Google Kalendář
            </button>
          </div>
        ) : (
          <button
            onClick={connectGoogle}
            disabled={isConnecting}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isConnecting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Link2 className="w-4 h-4" />
            )}
            Připojit Google Kalendář
          </button>
        )}
      </div>

      {/* Apple Calendar / ICS Feed */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <Calendar className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Apple Kalendář / ICS Feed</h3>
            <p className="text-sm text-gray-500">
              Předplatné kalendáře pro Apple Calendar, Outlook a další
            </p>
          </div>
        </div>

        {feedUrl ? (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Feed URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={feedUrl}
                  readOnly
                  className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-mono"
                />
                <button
                  onClick={copyFeedUrl}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  {isCopied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              <p className="mb-2">Jak přidat do kalendáře:</p>
              <ol className="list-decimal list-inside space-y-1 text-gray-500">
                <li>Zkopírujte URL výše</li>
                <li>V Apple Calendar: Soubor → Nové předplatné kalendáře</li>
                <li>V Outlook: Přidat kalendář → Z internetu</li>
                <li>Vložte URL a potvrďte</li>
              </ol>
            </div>

            <div className="flex gap-2">
              <button
                onClick={generateFeed}
                disabled={isGeneratingFeed}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 text-sm"
              >
                <RefreshCw className={`w-4 h-4 ${isGeneratingFeed ? 'animate-spin' : ''}`} />
                Obnovit URL
              </button>
              <button
                onClick={revokeFeed}
                className="flex items-center gap-2 px-3 py-2 text-red-600 hover:text-red-700 text-sm"
              >
                <Unlink className="w-4 h-4" />
                Zrušit feed
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Vygenerujte URL pro předplatné kalendáře. Tréninky a lekce se budou automaticky
              aktualizovat v připojeném kalendáři.
            </p>
            <button
              onClick={generateFeed}
              disabled={isGeneratingFeed}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 disabled:opacity-50"
            >
              {isGeneratingFeed ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Calendar className="w-4 h-4" />
              )}
              Vygenerovat feed URL
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
