/**
 * Vyfakturuj Settings Page
 *
 * Configuration page for Vyfakturuj.cz integration
 */

import { prisma } from '@/lib/prisma'
import { VyfakturujSettingsForm } from '@/components/admin/VyfakturujSettingsForm'
import Link from 'next/link'

async function getVyfakturujSettings() {
  try {
    let settings = await prisma.vyfakturujSettings.findFirst({
      where: { id: 'singleton' },
    })

    if (!settings) {
      settings = await prisma.vyfakturujSettings.create({
        data: {
          id: 'singleton',
          isConfigured: false,
          defaultDaysDue: 14,
          autoSyncCustomers: true,
        },
      })
    }

    return settings
  } catch (error) {
    console.error('Error fetching Vyfakturuj settings:', error)
    return null
  }
}

export default async function VyfakturujSettingsPage() {
  const settings = await getVyfakturujSettings()

  if (!settings) {
    return (
      <div className="px-4 py-8 sm:px-0">
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
          <p className="font-medium">Chyba při načítání nastavení</p>
          <p className="text-sm mt-1">Nepodařilo se načíst nastavení Vyfakturuj.</p>
        </div>
      </div>
    )
  }

  // Convert dates to ISO strings for client component
  const settingsData = {
    id: settings.id,
    isConfigured: settings.isConfigured,
    apiEmail: settings.apiEmail,
    hasApiKey: !!settings.apiKeyHash,
    defaultPaymentMethodId: settings.defaultPaymentMethodId,
    defaultNumberSeriesId: settings.defaultNumberSeriesId,
    defaultDaysDue: settings.defaultDaysDue,
    supplierName: settings.supplierName,
    supplierIco: settings.supplierIco,
    supplierDic: settings.supplierDic,
    supplierStreet: settings.supplierStreet,
    supplierCity: settings.supplierCity,
    supplierZip: settings.supplierZip,
    supplierCountry: settings.supplierCountry,
    supplierEmail: settings.supplierEmail,
    supplierPhone: settings.supplierPhone,
    supplierWeb: settings.supplierWeb,
    supplierBankAccount: settings.supplierBankAccount,
    supplierIban: settings.supplierIban,
    supplierBic: settings.supplierBic,
    textUnderSupplier: settings.textUnderSupplier,
    textInvoiceFooter: settings.textInvoiceFooter,
    autoSyncCustomers: settings.autoSyncCustomers,
    cachedPaymentMethods: settings.cachedPaymentMethods as unknown[] | null,
    cachedNumberSeries: settings.cachedNumberSeries as unknown[] | null,
    cachedTags: settings.cachedTags as unknown[] | null,
    cacheUpdatedAt: settings.cacheUpdatedAt?.toISOString() || null,
    // Webhook settings
    webhookSecret: settings.webhookSecret,
    webhookUrl: settings.webhookUrl,
    // Automation settings
    autoCreateProforma: settings.autoCreateProforma,
    // Reminder settings
    enableReminders: settings.enableReminders,
    reminder1Days: settings.reminder1Days,
    reminder2Days: settings.reminder2Days,
    reminder3Days: settings.reminder3Days,
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
          <li className="text-gray-900 font-medium">Vyfakturuj.cz</li>
        </ol>
      </nav>

      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Vyfakturuj.cz</h1>
            <p className="mt-1 text-sm text-gray-600">
              Napojení na fakturační systém Vyfakturuj.cz
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
              Připojeno jako: {settings.apiEmail}
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
              Zadejte přihlašovací údaje pro aktivaci napojení na Vyfakturuj.cz
            </p>
          </div>
        </div>
      )}

      <VyfakturujSettingsForm settings={settingsData} />
    </div>
  )
}
