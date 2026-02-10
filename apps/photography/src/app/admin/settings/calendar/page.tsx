'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  Calendar,
  RefreshCw,
  Loader2,
  CheckCircle,
  XCircle,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react'
import { format } from 'date-fns'
import { cs } from 'date-fns/locale'
import toast from 'react-hot-toast'

interface CalendarStatus {
  connected: boolean
  enabled: boolean
  calendarId: string | null
  lastSyncAt: string | null
  error: string | null
  tokenValid?: boolean
}

interface CalendarInfo {
  id: string
  summary: string
  primary: boolean
}

export default function CalendarSettingsPage() {
  const [status, setStatus] = useState<CalendarStatus | null>(null)
  const [calendars, setCalendars] = useState<CalendarInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/calendar')
      if (!res.ok) throw new Error('Failed to fetch status')
      const data = await res.json()
      setStatus(data)

      // If connected, fetch available calendars
      if (data.connected) {
        const calRes = await fetch('/api/calendar/google?action=calendars')
        if (calRes.ok) {
          const calData = await calRes.json()
          setCalendars(calData.calendars || [])
        }
      }
    } catch (error) {
      console.error('Failed to fetch calendar status:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStatus()

    // Check for OAuth callback
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    const state = urlParams.get('state')

    if (code) {
      handleOAuthCallback(code, state || undefined)
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [fetchStatus])

  const handleConnect = async () => {
    setActionLoading('connect')
    try {
      const res = await fetch('/api/calendar/google?action=auth')
      if (!res.ok) throw new Error('Failed to get auth URL')
      const data = await res.json()

      // Redirect to Google OAuth
      window.location.href = data.url
    } catch (error) {
      toast.error('Failed to connect Google Calendar')
      setActionLoading(null)
    }
  }

  const handleOAuthCallback = async (code: string, state?: string) => {
    setActionLoading('callback')
    try {
      const res = await fetch('/api/calendar/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, state }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to connect calendar')
      }

      const data = await res.json()
      setCalendars(data.calendars || [])
      toast.success('Google Calendar connected!')
      fetchStatus()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to connect')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect Google Calendar?')) return

    setActionLoading('disconnect')
    try {
      const res = await fetch('/api/calendar/google', { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to disconnect')

      setStatus({ connected: false, enabled: false, calendarId: null, lastSyncAt: null, error: null })
      setCalendars([])
      toast.success('Google Calendar disconnected')
    } catch {
      toast.error('Failed to disconnect calendar')
    } finally {
      setActionLoading(null)
    }
  }

  const handleCalendarChange = async (calendarId: string) => {
    setActionLoading('calendar')
    try {
      const res = await fetch('/api/calendar', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ calendarId }),
      })

      if (!res.ok) throw new Error('Failed to update calendar')

      await fetchStatus()
      toast.success('Calendar updated')
    } catch {
      toast.error('Failed to update calendar')
    } finally {
      setActionLoading(null)
    }
  }

  const handleToggleSync = async () => {
    if (!status) return

    setActionLoading('toggle')
    try {
      const res = await fetch('/api/calendar', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ syncEnabled: !status.enabled }),
      })

      if (!res.ok) throw new Error('Failed to update settings')

      await fetchStatus()
      toast.success(status.enabled ? 'Sync disabled' : 'Sync enabled')
    } catch {
      toast.error('Failed to update settings')
    } finally {
      setActionLoading(null)
    }
  }

  const handleSync = async () => {
    setActionLoading('sync')
    try {
      const res = await fetch('/api/calendar?action=sync', { method: 'POST' })
      if (!res.ok) throw new Error('Failed to sync')

      const data = await res.json()
      if (data.errors?.length > 0) {
        toast.error(`Synced ${data.synced} shoots with ${data.errors.length} errors`)
      } else {
        toast.success(`Synced ${data.synced} shoots`)
      }
      await fetchStatus()
    } catch {
      toast.error('Failed to sync calendar')
    } finally {
      setActionLoading(null)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Calendar Integration</h1>
          <p className="text-neutral-600 dark:text-neutral-400">Connect your Google Calendar to sync shoots automatically</p>
        </div>
        <Card className="p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-600" />
          <p className="text-neutral-500 dark:text-neutral-400 mt-4">Loading...</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Calendar Integration</h1>
        <p className="text-neutral-600 dark:text-neutral-400">Connect your Google Calendar to sync shoots automatically</p>
      </div>

      {/* Connection Status */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`p-3 rounded-full ${
                status?.connected ? 'bg-green-100' : 'bg-neutral-100 dark:bg-neutral-800'
              }`}
            >
              <Calendar
                className={`w-6 h-6 ${
                  status?.connected ? 'text-green-600' : 'text-neutral-400 dark:text-neutral-500'
                }`}
              />
            </div>
            <div>
              <h3 className="font-medium text-neutral-900 dark:text-neutral-100">Google Calendar</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {status?.connected ? 'Connected' : 'Not connected'}
              </p>
            </div>
          </div>

          {status?.connected ? (
            <Button
              variant="danger"
              onClick={handleDisconnect}
              disabled={actionLoading === 'disconnect'}
            >
              {actionLoading === 'disconnect' ? 'Disconnecting...' : 'Disconnect'}
            </Button>
          ) : (
            <Button
              onClick={handleConnect}
              disabled={actionLoading === 'connect' || actionLoading === 'callback'}
            >
              {actionLoading ? 'Connecting...' : 'Connect Google Calendar'}
            </Button>
          )}
        </div>

        {status?.error && (
          <div className="mt-4 p-4 bg-red-50 rounded-lg flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">Connection Error</p>
              <p className="text-sm text-red-600">{status.error}</p>
            </div>
          </div>
        )}
      </Card>

      {/* Settings (only when connected) */}
      {status?.connected && (
        <>
          {/* Calendar Selection */}
          <Card className="p-6">
            <h3 className="font-medium text-neutral-900 dark:text-neutral-100 mb-4">Select Calendar</h3>
            <select
              value={status.calendarId || ''}
              onChange={(e) => handleCalendarChange(e.target.value)}
              disabled={actionLoading === 'calendar'}
              className="w-full max-w-md px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="">Select a calendar...</option>
              {calendars.map((cal) => (
                <option key={cal.id} value={cal.id}>
                  {cal.summary} {cal.primary && '(Primary)'}
                </option>
              ))}
            </select>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
              Shoots will be synced to this calendar
            </p>
          </Card>

          {/* Sync Settings */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-neutral-900 dark:text-neutral-100">Auto-Sync</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Automatically sync new shoots to Google Calendar
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={status.enabled}
                  onChange={handleToggleSync}
                  disabled={actionLoading === 'toggle'}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-200 dark:bg-neutral-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:bg-neutral-900 after:border-neutral-300 dark:border-neutral-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
              </label>
            </div>
          </Card>

          {/* Sync Status */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-neutral-900 dark:text-neutral-100">Sync Status</h3>
                {status.lastSyncAt ? (
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Last synced:{' '}
                    {format(new Date(status.lastSyncAt), "d. MMMM yyyy 'v' HH:mm", {
                      locale: cs,
                    })}
                  </p>
                ) : (
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Never synced</p>
                )}
              </div>
              <Button
                variant="outline"
                onClick={handleSync}
                disabled={actionLoading === 'sync' || !status.calendarId}
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${actionLoading === 'sync' ? 'animate-spin' : ''}`}
                />
                {actionLoading === 'sync' ? 'Syncing...' : 'Sync Now'}
              </Button>
            </div>
          </Card>
        </>
      )}

      {/* Info */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="font-medium text-blue-900 mb-2">How it works</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 mt-0.5 text-blue-600" />
            When you create a new shoot, it will automatically appear in your Google Calendar
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 mt-0.5 text-blue-600" />
            Updates to shoot date/time will sync to the calendar event
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 mt-0.5 text-blue-600" />
            Calendar events include client name, package details, and location
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 mt-0.5 text-blue-600" />
            Reminders are set for 1 hour and 1 day before each shoot
          </li>
        </ul>
      </Card>
    </div>
  )
}
