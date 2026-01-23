/**
 * Google Calendar Settings Page
 *
 * Configuration page for Google Calendar integration
 */

import { prisma } from '@/lib/prisma'
import { GoogleCalendarSettingsForm } from '@/components/admin/GoogleCalendarSettingsForm'
import Link from 'next/link'
import { Calendar } from 'lucide-react'

async function getGoogleCalendarSettings() {
  try {
    let settings = await prisma.googleCalendarSettings.findFirst({
      where: { id: 'singleton' },
    })

    if (!settings) {
      settings = await prisma.googleCalendarSettings.create({
        data: {
          id: 'singleton',
          isConfigured: false,
        },
      })
    }

    return settings
  } catch (error) {
    console.error('Error fetching Google Calendar settings:', error)
    return null
  }
}

export default async function GoogleCalendarSettingsPage() {
  const settings = await getGoogleCalendarSettings()

  if (!settings) {
    return (
      <div className="px-4 py-8 sm:px-0">
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
          <p className="font-medium">Chyba při načítání nastavení</p>
          <p className="text-sm mt-1">Nepodařilo se načíst nastavení Google Calendar.</p>
        </div>
      </div>
    )
  }

  // Convert to client-safe format (hide sensitive data)
  const settingsData = {
    id: settings.id,
    isConfigured: settings.isConfigured,
    hasClientId: !!settings.clientId,
    hasClientSecret: !!settings.clientSecretEnc,
    hasRefreshToken: !!settings.refreshToken,
    calendarId: settings.calendarId,
    connectedEmail: settings.connectedEmail,
    connectedAt: settings.connectedAt?.toISOString() || null,
  }

  return (
    <div className="px-4 py-8 sm:px-0">
      {/* Breadcrumb */}
      <nav className="mb-4 text-sm">
        <ol className="flex items-center space-x-2 text-gray-500">
          <li>
            <Link href="/admin/settings" className="hover:text-gray-700">
              Nastavení
            </Link>
          </li>
          <li>/</li>
          <li className="text-gray-900 font-medium">Google Calendar</li>
        </ol>
      </nav>

      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Google Calendar</h1>
            <p className="mt-1 text-sm text-gray-600">
              Integrace s Google Calendar pro automatické odesílání pozvánek účastníkům
            </p>
          </div>
        </div>
      </div>

      {/* Status Banner */}
      {settings.isConfigured ? (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <div className="flex-shrink-0">
            <svg
              className="w-5 h-5 text-green-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-green-800">
              Integrace je aktivní
            </p>
            <p className="text-sm text-green-700">
              Připojeno jako: {settings.connectedEmail}
              {settings.calendarId && ` • Kalendář: ${settings.calendarId}`}
            </p>
          </div>
        </div>
      ) : (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
          <div className="flex-shrink-0">
            <svg
              className="w-5 h-5 text-yellow-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-yellow-800">
              Integrace není nakonfigurována
            </p>
            <p className="text-sm text-yellow-700">
              Zadejte OAuth credentials z Google Cloud Console pro aktivaci integrace
            </p>
          </div>
        </div>
      )}

      <GoogleCalendarSettingsForm settings={settingsData} />
    </div>
  )
}
