'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Calendar, ExternalLink, Copy, RefreshCw, Check, X, Loader2, Apple } from 'lucide-react'
import toast from 'react-hot-toast'

interface CalendarIntegration {
  id: string
  provider: string
  calendarId: string
  syncEnabled: boolean
  lastSyncAt?: string
  syncErrors?: { lastError?: string; lastErrorAt?: string }
}

export default function CalendarSettings() {
  const [isLoading, setIsLoading] = useState(true)
  const [googleIntegration, setGoogleIntegration] = useState<CalendarIntegration | null>(null)
  const [icsFeedUrl, setIcsFeedUrl] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const [isGeneratingFeed, setIsGeneratingFeed] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchIntegrationStatus()
    fetchFeedUrl()
  }, [])

  const fetchIntegrationStatus = async () => {
    try {
      const res = await fetch('/api/calendar/status')
      if (res.ok) {
        const data = await res.json()
        setGoogleIntegration(data.google || null)
      }
    } catch (error) {
      console.error('Failed to fetch integration status')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchFeedUrl = async () => {
    try {
      const res = await fetch('/api/calendar/feed/generate')
      if (res.ok) {
        const data = await res.json()
        setIcsFeedUrl(data.feedUrl || null)
      }
    } catch (error) {
      console.error('Failed to fetch feed URL')
    }
  }

  const handleConnectGoogle = async () => {
    setIsConnecting(true)
    try {
      const res = await fetch('/api/calendar/google/auth')
      if (!res.ok) throw new Error('Failed to get auth URL')
      const { authUrl } = await res.json()
      window.location.href = authUrl
    } catch (error) {
      toast.error('Nepodařilo se připojit ke Google Calendar')
      setIsConnecting(false)
    }
  }

  const handleDisconnectGoogle = async () => {
    setIsDisconnecting(true)
    try {
      const res = await fetch('/api/calendar/google/disconnect', { method: 'POST' })
      if (!res.ok) throw new Error('Failed to disconnect')
      setGoogleIntegration(null)
      toast.success('Google Calendar odpojen')
    } catch (error) {
      toast.error('Nepodařilo se odpojit Google Calendar')
    } finally {
      setIsDisconnecting(false)
    }
  }

  const handleGenerateFeed = async () => {
    setIsGeneratingFeed(true)
    try {
      const res = await fetch('/api/calendar/feed/generate', { method: 'POST' })
      if (!res.ok) throw new Error('Failed to generate feed')
      const { feedUrl } = await res.json()
      setIcsFeedUrl(feedUrl)
      toast.success('ICS feed vygenerován')
    } catch (error) {
      toast.error('Nepodařilo se vygenerovat feed')
    } finally {
      setIsGeneratingFeed(false)
    }
  }

  const handleCopyFeedUrl = async () => {
    if (!icsFeedUrl) return
    try {
      await navigator.clipboard.writeText(icsFeedUrl)
      setCopied(true)
      toast.success('URL zkopírována')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Nepodařilo se zkopírovat')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Google Calendar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          {googleIntegration ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge variant="success">Připojeno</Badge>
                {googleIntegration.lastSyncAt && (
                  <span className="text-sm text-gray-500">
                    Poslední sync: {new Date(googleIntegration.lastSyncAt).toLocaleString('cs-CZ')}
                  </span>
                )}
              </div>

              {googleIntegration.syncErrors?.lastError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  <p className="font-medium">Poslední chyba synchronizace:</p>
                  <p>{googleIntegration.syncErrors.lastError}</p>
                </div>
              )}

              <p className="text-sm text-gray-600">
                Vaše gigy se automaticky synchronizují do Google Calendar.
                Změny v GigBooku se projeví v kalendáři do několika minut.
              </p>

              <Button
                variant="destructive"
                onClick={handleDisconnectGoogle}
                disabled={isDisconnecting}
              >
                {isDisconnecting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <X className="h-4 w-4 mr-2" />
                )}
                Odpojit Google Calendar
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Připojte svůj Google Calendar pro automatickou synchronizaci gigů.
                Každý nový nebo upravený gig se automaticky objeví ve vašem kalendáři.
              </p>
              <Button onClick={handleConnectGoogle} disabled={isConnecting}>
                {isConnecting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <ExternalLink className="h-4 w-4 mr-2" />
                )}
                Připojit Google Calendar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Apple Calendar / ICS Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Apple className="w-5 h-5" />
            Apple Calendar / ICS Feed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Získejte ICS feed URL pro přidání do Apple Calendar, Outlook nebo jiné aplikace
              podporující iCalendar formát. Kalendář se automaticky aktualizuje.
            </p>

            {icsFeedUrl ? (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={icsFeedUrl}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button variant="outline" onClick={handleCopyFeedUrl}>
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateFeed}
                    disabled={isGeneratingFeed}
                  >
                    {isGeneratingFeed ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Vygenerovat novou URL
                  </Button>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                  <p className="font-medium mb-1">Jak přidat do Apple Calendar:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Otevřete aplikaci Kalendář na Macu nebo iPhone</li>
                    <li>Soubor → Nové přihlášení kalendáře (nebo Přidat účet)</li>
                    <li>Vložte URL adresu výše</li>
                  </ol>
                </div>
              </div>
            ) : (
              <Button onClick={handleGenerateFeed} disabled={isGeneratingFeed}>
                {isGeneratingFeed ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Calendar className="h-4 w-4 mr-2" />
                )}
                Vygenerovat ICS Feed
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
