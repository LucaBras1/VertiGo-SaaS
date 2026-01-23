'use client'

/**
 * Google Calendar Settings Form Component
 *
 * Form for configuring Google Calendar integration
 * Sections: OAuth Credentials, Calendar Selection
 */

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ExternalLink, RefreshCw, Unlink, Check, AlertCircle } from 'lucide-react'

interface GoogleCalendarSettingsFormProps {
  settings: {
    id: string
    isConfigured: boolean
    hasClientId: boolean
    hasClientSecret: boolean
    hasRefreshToken: boolean
    calendarId?: string | null
    connectedEmail?: string | null
    connectedAt?: string | null
  }
}

interface CalendarListItem {
  id: string
  summary: string
  primary?: boolean
  accessRole: string
}

export function GoogleCalendarSettingsForm({ settings }: GoogleCalendarSettingsFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // OAuth Credentials
  const [clientId, setClientId] = useState('')
  const [clientSecret, setClientSecret] = useState('')

  // Calendar selection
  const [calendars, setCalendars] = useState<CalendarListItem[]>([])
  const [selectedCalendarId, setSelectedCalendarId] = useState(settings.calendarId || '')
  const [loadingCalendars, setLoadingCalendars] = useState(false)

  // Check for OAuth callback messages
  useEffect(() => {
    const oauthSuccess = searchParams.get('oauth_success')
    const oauthError = searchParams.get('oauth_error')

    if (oauthSuccess === 'true') {
      setSuccess('Google účet byl úspěšně propojen!')
      // Load calendars after successful OAuth
      loadCalendars()
      // Clean URL
      router.replace('/admin/settings/google-calendar')
    } else if (oauthError) {
      setError(`Chyba při propojení: ${oauthError}`)
      router.replace('/admin/settings/google-calendar')
    }
  }, [searchParams, router])

  // Load calendars if already connected
  useEffect(() => {
    if (settings.hasRefreshToken) {
      loadCalendars()
    }
  }, [settings.hasRefreshToken])

  const loadCalendars = async () => {
    setLoadingCalendars(true)
    try {
      const response = await fetch('/api/admin/google-calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'list-calendars' }),
      })
      const data = await response.json()

      if (data.success && data.calendars) {
        setCalendars(data.calendars)
      }
    } catch (err) {
      console.error('Error loading calendars:', err)
    } finally {
      setLoadingCalendars(false)
    }
  }

  const handleSaveCredentials = async () => {
    if (!clientId.trim() || !clientSecret.trim()) {
      setError('Vyplňte oba údaje - Client ID i Client Secret')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/admin/google-calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save-credentials',
          clientId: clientId.trim(),
          clientSecret: clientSecret.trim(),
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('Credentials uloženy. Nyní se můžete připojit ke Google účtu.')
        setClientId('')
        setClientSecret('')
        router.refresh()
      } else {
        setError(data.error || 'Chyba při ukládání')
      }
    } catch (err: any) {
      setError(err.message || 'Chyba při ukládání')
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/google-calendar/auth')
      const data = await response.json()

      if (data.success && data.authUrl) {
        // Redirect to Google OAuth
        window.location.href = data.authUrl
      } else {
        setError(data.error || 'Nepodařilo se získat autorizační URL')
        setLoading(false)
      }
    } catch (err: any) {
      setError(err.message || 'Chyba při připojování')
      setLoading(false)
    }
  }

  const handleDisconnect = async () => {
    if (!confirm('Opravdu chcete odpojit Google Calendar? Tato akce smaže uložené tokeny.')) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/google-calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'disconnect' }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('Google Calendar byl odpojen')
        setCalendars([])
        setSelectedCalendarId('')
        router.refresh()
      } else {
        setError(data.error || 'Chyba při odpojování')
      }
    } catch (err: any) {
      setError(err.message || 'Chyba při odpojování')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveCalendar = async () => {
    if (!selectedCalendarId) {
      setError('Vyberte kalendář')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/google-calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save-calendar',
          calendarId: selectedCalendarId,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('Kalendář byl uložen')
        router.refresh()
      } else {
        setError(data.error || 'Chyba při ukládání kalendáře')
      }
    } catch (err: any) {
      setError(err.message || 'Chyba při ukládání')
    } finally {
      setLoading(false)
    }
  }

  const isConnected = settings.hasRefreshToken

  return (
    <div className="space-y-8">
      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">Chyba</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-green-800">Úspěch</p>
            <p className="text-sm text-green-700">{success}</p>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Jak získat OAuth 2.0 Credentials</h3>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>Přejděte na <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="underline font-medium">Google Cloud Console</a></li>
          <li>Vytvořte nový projekt nebo vyberte existující</li>
          <li>Povolte Google Calendar API v sekci "APIs & Services"</li>
          <li>Vytvořte OAuth 2.0 credentials (Web application)</li>
          <li>Přidejte Redirect URI: <code className="bg-blue-100 px-1 rounded">{typeof window !== 'undefined' ? `${window.location.origin}/api/admin/google-calendar/callback` : '/api/admin/google-calendar/callback'}</code></li>
          <li>Zkopírujte Client ID a Client Secret</li>
        </ol>
      </div>

      {/* OAuth Credentials Section */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">OAuth 2.0 Credentials</h2>
          <p className="text-sm text-gray-500 mt-1">
            Přihlašovací údaje z Google Cloud Console
          </p>
        </div>

        <div className="p-6 space-y-4">
          {/* Status indicators */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${settings.hasClientId ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className="text-gray-600">Client ID</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${settings.hasClientSecret ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className="text-gray-600">Client Secret</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className="text-gray-600">Připojeno</span>
            </div>
          </div>

          {/* Credentials Form */}
          {!isConnected && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client ID
                </label>
                <input
                  type="text"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  placeholder={settings.hasClientId ? '(již nastaveno - zadejte nové pro přepsání)' : 'xxxxxxxxx.apps.googleusercontent.com'}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client Secret
                </label>
                <input
                  type="password"
                  value={clientSecret}
                  onChange={(e) => setClientSecret(e.target.value)}
                  placeholder={settings.hasClientSecret ? '(již nastaveno - zadejte nové pro přepsání)' : 'GOCSPX-xxxxxxxxxxxxxxxxxx'}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleSaveCredentials}
                  disabled={loading || (!clientId && !clientSecret)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Ukládám...' : 'Uložit credentials'}
                </button>

                {settings.hasClientId && settings.hasClientSecret && (
                  <button
                    type="button"
                    onClick={handleConnect}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    {loading ? 'Přesměrování...' : 'Připojit Google účet'}
                  </button>
                )}
              </div>
            </>
          )}

          {/* Connected state */}
          {isConnected && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      Připojený účet: {settings.connectedEmail}
                    </p>
                    {settings.connectedAt && (
                      <p className="text-xs text-green-600 mt-1">
                        Připojeno: {new Date(settings.connectedAt).toLocaleString('cs-CZ')}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleDisconnect}
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 disabled:opacity-50 transition-colors"
                  >
                    <Unlink className="w-4 h-4" />
                    Odpojit
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Calendar Selection Section */}
      {isConnected && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Výběr kalendáře</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Vyberte kalendář, do kterého se budou vytvářet události
                </p>
              </div>
              <button
                type="button"
                onClick={loadCalendars}
                disabled={loadingCalendars}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loadingCalendars ? 'animate-spin' : ''}`} />
                Obnovit
              </button>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {loadingCalendars ? (
              <div className="text-center py-4 text-gray-500">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                <p>Načítám kalendáře...</p>
              </div>
            ) : calendars.length === 0 ? (
              <p className="text-gray-500 text-sm">
                Žádné kalendáře nebyly načteny. Klikněte na "Obnovit" pro načtení.
              </p>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kalendář pro události
                  </label>
                  <select
                    value={selectedCalendarId}
                    onChange={(e) => setSelectedCalendarId(e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Vyberte kalendář...</option>
                    {calendars.map((cal) => (
                      <option key={cal.id} value={cal.id}>
                        {cal.summary} {cal.primary ? '(primární)' : ''} [{cal.accessRole}]
                      </option>
                    ))}
                  </select>
                </div>

                {settings.calendarId && (
                  <p className="text-sm text-gray-500">
                    Aktuálně vybraný: <span className="font-medium">{settings.calendarId}</span>
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleSaveCalendar}
                  disabled={loading || !selectedCalendarId}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Ukládám...' : 'Uložit vybraný kalendář'}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Usage Info */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Jak integrace funguje</h3>
        <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
          <li>Po přidání účastníků k objednávce můžete odeslat pozvánky</li>
          <li>Automaticky se vytvoří událost v Google Calendar s detaily akce</li>
          <li>Účastníci obdrží email s pozvánkou do kalendáře</li>
          <li>Zaměstnanci vidí všechny detaily včetně interních poznámek</li>
          <li>Zákazníci vidí cenu (pokud je nastaveno), ale ne interní poznámky</li>
        </ul>
      </div>
    </div>
  )
}
