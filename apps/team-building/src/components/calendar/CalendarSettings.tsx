'use client'

import { useState, useEffect } from 'react'
import { Calendar, Loader2, Check, AlertCircle } from 'lucide-react'
import { GoogleCalendarConnect } from './GoogleCalendarConnect'
import { ICSFeedSettings } from './ICSFeedSettings'

interface CalendarStatus {
  configured: boolean
  connected: boolean
  syncEnabled?: boolean
  calendarId?: string
  lastSyncAt?: string
  calendars?: Array<{ id: string; summary: string; primary: boolean }>
  error?: string
}

export function CalendarSettings() {
  const [status, setStatus] = useState<CalendarStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStatus()
  }, [])

  const fetchStatus = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/calendar/google/status')
      if (res.ok) {
        setStatus(await res.json())
      }
    } catch (error) {
      console.error('Error fetching calendar status:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDisconnect = async () => {
    if (!confirm('Opravdu chcete odpojit Google Calendar?')) return

    try {
      const res = await fetch('/api/calendar/google/disconnect', { method: 'POST' })
      if (res.ok) {
        fetchStatus()
      }
    } catch (error) {
      console.error('Error disconnecting:', error)
    }
  }

  const handleSettingsUpdate = async (settings: { calendarId?: string; syncEnabled?: boolean }) => {
    try {
      const res = await fetch('/api/calendar/google/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      if (res.ok) {
        fetchStatus()
      }
    } catch (error) {
      console.error('Error updating settings:', error)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">Integrace kalendáře</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Google Calendar */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">Google Calendar</h3>
        </div>

        {!status?.configured && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800">Google Calendar není nakonfigurován</p>
                <p className="text-sm text-yellow-700 mt-1">
                  Pro synchronizaci s Google Calendar je potřeba nastavit GOOGLE_CLIENT_ID a GOOGLE_CLIENT_SECRET v
                  environment variables.
                </p>
              </div>
            </div>
          </div>
        )}

        {status?.configured && !status?.connected && (
          <GoogleCalendarConnect onConnect={fetchStatus} />
        )}

        {status?.configured && status?.connected && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <Check className="h-5 w-5 text-green-600" />
              <span className="text-green-800 font-medium">Google Calendar připojen</span>
            </div>

            {/* Calendar selection */}
            {status.calendars && status.calendars.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cílový kalendář</label>
                <select
                  value={status.calendarId || 'primary'}
                  onChange={(e) => handleSettingsUpdate({ calendarId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {status.calendars.map((cal) => (
                    <option key={cal.id} value={cal.id}>
                      {cal.summary} {cal.primary && '(Primary)'}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Sync toggle */}
            <div className="flex items-center justify-between py-3 border-t border-gray-100">
              <div>
                <p className="font-medium text-gray-900">Automatická synchronizace</p>
                <p className="text-sm text-gray-500">Synchronizovat sessions automaticky do kalendáře</p>
              </div>
              <button
                onClick={() => handleSettingsUpdate({ syncEnabled: !status.syncEnabled })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  status.syncEnabled ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    status.syncEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {status.lastSyncAt && (
              <p className="text-sm text-gray-500">
                Poslední synchronizace: {new Date(status.lastSyncAt).toLocaleString('cs-CZ')}
              </p>
            )}

            <div className="pt-3 border-t border-gray-100">
              <button
                onClick={handleDisconnect}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Odpojit Google Calendar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ICS Feed */}
      <ICSFeedSettings />
    </div>
  )
}
