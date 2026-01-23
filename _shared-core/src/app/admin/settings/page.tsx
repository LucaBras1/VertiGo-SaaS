/**
 * Settings Page
 *
 * Global site settings (singleton)
 */

import { prisma } from '@/lib/prisma'
import { SettingsForm } from '@/components/admin/SettingsForm'
import Link from 'next/link'
import { FileText, Settings, CreditCard, Palette, Calendar } from 'lucide-react'

async function getSettings() {
  try {
    // Get the first (and only) settings record
    let settings = await prisma.settings.findFirst()

    // If no settings exist, create default
    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          siteTitle: 'Divadlo Studna',
          siteDescription: 'Divadlo pro děti a mládež',
          contactEmail: '',
          contactPhone: '',
          address: undefined,
          socialLinks: undefined,
        },
      })
    }

    return settings
  } catch (error) {
    console.error('Error fetching settings:', error)
    return null
  }
}

async function getVyfakturujStatus() {
  try {
    const vyfakturujSettings = await prisma.vyfakturujSettings.findFirst({
      where: { id: 'singleton' },
    })
    return {
      isConfigured: vyfakturujSettings?.isConfigured || false,
      apiEmail: vyfakturujSettings?.apiEmail || null,
    }
  } catch (error) {
    return { isConfigured: false, apiEmail: null }
  }
}

async function getGoogleCalendarStatus() {
  try {
    const gcSettings = await prisma.googleCalendarSettings.findFirst({
      where: { id: 'singleton' },
    })
    return {
      isConfigured: gcSettings?.isConfigured || false,
      connectedEmail: gcSettings?.connectedEmail || null,
    }
  } catch (error) {
    return { isConfigured: false, connectedEmail: null }
  }
}

export default async function SettingsPage() {
  const [settings, vyfakturujStatus, googleCalendarStatus] = await Promise.all([
    getSettings(),
    getVyfakturujStatus(),
    getGoogleCalendarStatus(),
  ])

  if (!settings) {
    return (
      <div className="px-4 py-8 sm:px-0">
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
          <p className="font-medium">Chyba při načítání nastavení</p>
          <p className="text-sm mt-1">Nepodařilo se načíst nastavení webu.</p>
        </div>
      </div>
    )
  }

  // Convert dates to ISO strings for client component
  const settingsData = {
    ...settings,
    createdAt: settings.createdAt.toISOString(),
    updatedAt: settings.updatedAt.toISOString(),
  }

  return (
    <div className="px-4 py-8 sm:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Nastavení</h1>
        <p className="mt-2 text-sm text-gray-600">
          Globální nastavení a konfigurace webu
        </p>
      </div>

      {/* Settings Navigation Cards */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Vyfakturuj.cz Card */}
        <Link
          href="/admin/settings/vyfakturuj"
          className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 overflow-hidden"
        >
          <div className="p-5">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900">
                  Vyfakturuj.cz
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Napojení na fakturační systém
                </p>
                <div className="mt-3">
                  {vyfakturujStatus.isConfigured ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                      Aktivní
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
                      Nenakonfigurováno
                    </span>
                  )}
                </div>
              </div>
              <div className="flex-shrink-0 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </Link>

        {/* Appearance Card */}
        <Link
          href="/admin/settings/appearance"
          className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 overflow-hidden"
        >
          <div className="p-5">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Palette className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900">
                  Vzhled
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Tmavý/světlý režim administrace
                </p>
                <div className="mt-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Personalizace
                  </span>
                </div>
              </div>
              <div className="flex-shrink-0 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </Link>

        {/* Google Calendar Card */}
        <Link
          href="/admin/settings/google-calendar"
          className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 overflow-hidden"
        >
          <div className="p-5">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900">
                  Google Calendar
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Automatické pozvánky účastníkům
                </p>
                <div className="mt-3">
                  {googleCalendarStatus.isConfigured ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                      Aktivní
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
                      Nenakonfigurováno
                    </span>
                  )}
                </div>
              </div>
              <div className="flex-shrink-0 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 pt-8 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-1">Nastavení webu</h2>
        <p className="text-sm text-gray-500">Základní informace o webu a kontaktní údaje</p>
      </div>

      <SettingsForm key={settings.updatedAt.toISOString()} settings={settingsData} />
    </div>
  )
}
