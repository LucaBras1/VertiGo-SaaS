'use client'

/**
 * Vyfakturuj Settings Form Component
 *
 * Form for configuring Vyfakturuj.cz integration
 * Sections: API Credentials, Default Settings, Supplier Info, Invoice Text
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface VyfakturujSettingsFormProps {
  settings: {
    id: string
    isConfigured: boolean
    apiEmail?: string | null
    hasApiKey?: boolean
    defaultPaymentMethodId?: number | null
    defaultNumberSeriesId?: number | null
    defaultDaysDue: number
    supplierName?: string | null
    supplierIco?: string | null
    supplierDic?: string | null
    supplierStreet?: string | null
    supplierCity?: string | null
    supplierZip?: string | null
    supplierCountry?: string | null
    supplierEmail?: string | null
    supplierPhone?: string | null
    supplierWeb?: string | null
    supplierBankAccount?: string | null
    supplierIban?: string | null
    supplierBic?: string | null
    textUnderSupplier?: string | null
    textInvoiceFooter?: string | null
    autoSyncCustomers: boolean
    cachedPaymentMethods?: unknown[] | null
    cachedNumberSeries?: unknown[] | null
    cachedTags?: unknown[] | null
    cacheUpdatedAt?: string | null
    // Webhook settings
    webhookSecret?: string | null
    webhookUrl?: string | null
    // Automation settings
    autoCreateProforma?: boolean
    // Reminder settings
    enableReminders?: boolean
    reminder1Days?: number
    reminder2Days?: number
    reminder3Days?: number
  }
}

interface PaymentMethod {
  id: number
  name: string
  type?: number
}

interface NumberSeries {
  id: number
  name: string
  type?: number
  pattern?: string
}

export function VyfakturujSettingsForm({ settings }: VyfakturujSettingsFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [testLoading, setTestLoading] = useState(false)
  const [refreshLoading, setRefreshLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

  // API Credentials
  const [apiEmail, setApiEmail] = useState(settings.apiEmail || '')
  const [apiKey, setApiKey] = useState('')

  // Default Settings
  const [defaultPaymentMethodId, setDefaultPaymentMethodId] = useState<number | ''>(
    settings.defaultPaymentMethodId || ''
  )
  const [defaultNumberSeriesId, setDefaultNumberSeriesId] = useState<number | ''>(
    settings.defaultNumberSeriesId || ''
  )
  const [defaultDaysDue, setDefaultDaysDue] = useState(settings.defaultDaysDue)

  // Supplier Information
  const [supplierName, setSupplierName] = useState(settings.supplierName || '')
  const [supplierIco, setSupplierIco] = useState(settings.supplierIco || '')
  const [supplierDic, setSupplierDic] = useState(settings.supplierDic || '')
  const [supplierStreet, setSupplierStreet] = useState(settings.supplierStreet || '')
  const [supplierCity, setSupplierCity] = useState(settings.supplierCity || '')
  const [supplierZip, setSupplierZip] = useState(settings.supplierZip || '')
  const [supplierCountry, setSupplierCountry] = useState(settings.supplierCountry || 'CZ')
  const [supplierEmail, setSupplierEmail] = useState(settings.supplierEmail || '')
  const [supplierPhone, setSupplierPhone] = useState(settings.supplierPhone || '')
  const [supplierWeb, setSupplierWeb] = useState(settings.supplierWeb || '')
  const [supplierBankAccount, setSupplierBankAccount] = useState(settings.supplierBankAccount || '')
  const [supplierIban, setSupplierIban] = useState(settings.supplierIban || '')
  const [supplierBic, setSupplierBic] = useState(settings.supplierBic || '')

  // Invoice Text
  const [textUnderSupplier, setTextUnderSupplier] = useState(settings.textUnderSupplier || '')
  const [textInvoiceFooter, setTextInvoiceFooter] = useState(settings.textInvoiceFooter || '')

  // Sync Settings
  const [autoSyncCustomers, setAutoSyncCustomers] = useState(settings.autoSyncCustomers)

  // Webhook Settings
  const [webhookSecret, setWebhookSecret] = useState(settings.webhookSecret || '')
  const [generatingSecret, setGeneratingSecret] = useState(false)

  // Automation Settings
  const [autoCreateProforma, setAutoCreateProforma] = useState(settings.autoCreateProforma || false)

  // Reminder Settings
  const [enableReminders, setEnableReminders] = useState(settings.enableReminders || false)
  const [reminder1Days, setReminder1Days] = useState(settings.reminder1Days || 7)
  const [reminder2Days, setReminder2Days] = useState(settings.reminder2Days || 14)
  const [reminder3Days, setReminder3Days] = useState(settings.reminder3Days || 30)

  // Cached data
  const paymentMethods = (settings.cachedPaymentMethods || []) as PaymentMethod[]
  const numberSeries = (settings.cachedNumberSeries || []) as NumberSeries[]

  // Test connection
  const handleTest = async () => {
    if (!apiEmail) {
      setTestResult({ success: false, message: 'Zadejte e-mail' })
      return
    }

    const keyToTest = apiKey || (settings.hasApiKey ? 'EXISTING' : '')
    if (!keyToTest) {
      setTestResult({ success: false, message: 'Zadejte API klíč' })
      return
    }

    setTestLoading(true)
    setTestResult(null)

    try {
      // If using existing key, we need to save first to test with stored key
      if (!apiKey && settings.hasApiKey) {
        // Test by calling refresh-cache which uses stored credentials
        const response = await fetch('/api/admin/vyfakturuj/refresh-cache', {
          method: 'POST',
        })
        const result = await response.json()

        if (response.ok && result.success) {
          setTestResult({ success: true, message: 'Spojení funkční' })
        } else {
          setTestResult({ success: false, message: result.error || 'Test selhal' })
        }
      } else {
        // Test with new credentials
        const response = await fetch('/api/admin/vyfakturuj/test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: apiEmail, apiKey }),
        })
        const result = await response.json()

        if (result.success) {
          setTestResult({ success: true, message: result.message })
        } else {
          setTestResult({ success: false, message: result.error || 'Test selhal' })
        }
      }
    } catch (err) {
      setTestResult({
        success: false,
        message: err instanceof Error ? err.message : 'Test selhal',
      })
    } finally {
      setTestLoading(false)
    }
  }

  // Generate webhook secret
  const handleGenerateSecret = () => {
    setGeneratingSecret(true)
    // Generate a random 32-character hex string
    const array = new Uint8Array(16)
    crypto.getRandomValues(array)
    const secret = Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('')
    setWebhookSecret(secret)
    setGeneratingSecret(false)
  }

  // Refresh cache
  const handleRefreshCache = async () => {
    setRefreshLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/vyfakturuj/refresh-cache', {
        method: 'POST',
      })
      const result = await response.json()

      if (response.ok && result.success) {
        setSuccess('Cache byla aktualizována')
        router.refresh()
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(result.error || 'Nepodařilo se aktualizovat cache')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba při aktualizaci cache')
    } finally {
      setRefreshLoading(false)
    }
  }

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      const data: Record<string, unknown> = {
        apiEmail: apiEmail || null,
        defaultPaymentMethodId: defaultPaymentMethodId || null,
        defaultNumberSeriesId: defaultNumberSeriesId || null,
        defaultDaysDue,
        supplierName: supplierName || null,
        supplierIco: supplierIco || null,
        supplierDic: supplierDic || null,
        supplierStreet: supplierStreet || null,
        supplierCity: supplierCity || null,
        supplierZip: supplierZip || null,
        supplierCountry: supplierCountry || null,
        supplierEmail: supplierEmail || null,
        supplierPhone: supplierPhone || null,
        supplierWeb: supplierWeb || null,
        supplierBankAccount: supplierBankAccount || null,
        supplierIban: supplierIban || null,
        supplierBic: supplierBic || null,
        textUnderSupplier: textUnderSupplier || null,
        textInvoiceFooter: textInvoiceFooter || null,
        autoSyncCustomers,
        // Webhook settings
        webhookSecret: webhookSecret || null,
        // Automation settings
        autoCreateProforma,
        // Reminder settings
        enableReminders,
        reminder1Days,
        reminder2Days,
        reminder3Days,
      }

      // Only include API key if provided (new key)
      if (apiKey) {
        data.apiKey = apiKey
      }

      const response = await fetch('/api/admin/vyfakturuj/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Nepodařilo se uložit nastavení')
      }

      setSuccess('Nastavení bylo uloženo')
      setApiKey('') // Clear the API key field after successful save
      router.refresh()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nepodařilo se uložit nastavení')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
          <p className="font-medium">Chyba</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md">
          <p className="font-medium">{success}</p>
        </div>
      )}

      {/* API Credentials */}
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">API přihlášení</h3>
            <p className="mt-1 text-sm text-gray-500">
              Přihlašovací údaje k Vyfakturuj.cz API. Najdete je v nastavení vašeho účtu.
            </p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2 space-y-6">
            {/* API Email */}
            <div>
              <label htmlFor="apiEmail" className="block text-sm font-medium text-gray-700">
                E-mail (login) <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="apiEmail"
                value={apiEmail}
                onChange={(e) => setApiEmail(e.target.value)}
                placeholder="vas-email@example.cz"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            {/* API Key */}
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">
                API klíč{' '}
                {settings.hasApiKey ? (
                  <span className="text-green-600">(uložen)</span>
                ) : (
                  <span className="text-red-500">*</span>
                )}
              </label>
              <input
                type="password"
                id="apiKey"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={settings.hasApiKey ? '••••••••••••••••' : 'Zadejte API klíč'}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">
                {settings.hasApiKey
                  ? 'Nechte prázdné pro zachování současného klíče, nebo zadejte nový.'
                  : 'API klíč vygenerujete v nastavení Vyfakturuj.cz.'}
              </p>
            </div>

            {/* Test Connection Button */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={handleTest}
                disabled={testLoading}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {testLoading ? 'Testuji...' : 'Test spojení'}
              </button>

              {testResult && (
                <div
                  className={`flex items-center gap-2 text-sm ${
                    testResult.success ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {testResult.success ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  {testResult.message}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Default Settings */}
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Výchozí nastavení</h3>
            <p className="mt-1 text-sm text-gray-500">
              Výchozí hodnoty pro nové faktury
            </p>
            {settings.isConfigured && (
              <button
                type="button"
                onClick={handleRefreshCache}
                disabled={refreshLoading}
                className="mt-4 text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
              >
                {refreshLoading ? 'Aktualizuji...' : 'Aktualizovat seznamy z Vyfakturuj'}
              </button>
            )}
            {settings.cacheUpdatedAt && (
              <p className="mt-2 text-xs text-gray-400">
                Naposledy aktualizováno:{' '}
                {new Date(settings.cacheUpdatedAt).toLocaleString('cs-CZ')}
              </p>
            )}
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2 space-y-6">
            {/* Payment Method */}
            <div>
              <label
                htmlFor="defaultPaymentMethodId"
                className="block text-sm font-medium text-gray-700"
              >
                Výchozí platební metoda
              </label>
              <select
                id="defaultPaymentMethodId"
                value={defaultPaymentMethodId}
                onChange={(e) =>
                  setDefaultPaymentMethodId(e.target.value ? parseInt(e.target.value) : '')
                }
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">-- Vyberte --</option>
                {paymentMethods.map((method) => (
                  <option key={method.id} value={method.id}>
                    {method.name}
                  </option>
                ))}
              </select>
              {paymentMethods.length === 0 && settings.isConfigured && (
                <p className="mt-1 text-xs text-yellow-600">
                  Klikněte na &quot;Aktualizovat seznamy&quot; pro načtení platebních metod
                </p>
              )}
            </div>

            {/* Number Series */}
            <div>
              <label
                htmlFor="defaultNumberSeriesId"
                className="block text-sm font-medium text-gray-700"
              >
                Výchozí číselná řada
              </label>
              <select
                id="defaultNumberSeriesId"
                value={defaultNumberSeriesId}
                onChange={(e) =>
                  setDefaultNumberSeriesId(e.target.value ? parseInt(e.target.value) : '')
                }
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">-- Vyberte --</option>
                {numberSeries.map((series) => (
                  <option key={series.id} value={series.id}>
                    {series.name}
                    {series.pattern && ` (${series.pattern})`}
                  </option>
                ))}
              </select>
            </div>

            {/* Days Due */}
            <div>
              <label htmlFor="defaultDaysDue" className="block text-sm font-medium text-gray-700">
                Výchozí splatnost (dny)
              </label>
              <input
                type="number"
                id="defaultDaysDue"
                value={defaultDaysDue}
                onChange={(e) => setDefaultDaysDue(parseInt(e.target.value) || 14)}
                min={1}
                max={365}
                className="mt-1 block w-32 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            {/* Auto Sync */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="autoSyncCustomers"
                checked={autoSyncCustomers}
                onChange={(e) => setAutoSyncCustomers(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="autoSyncCustomers" className="text-sm text-gray-700">
                Automaticky synchronizovat zákazníky s Vyfakturuj.cz
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Supplier Information */}
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Údaje dodavatele</h3>
            <p className="mt-1 text-sm text-gray-500">
              Informace o vaší společnosti pro faktury (přepíše nastavení ve Vyfakturuj)
            </p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2 space-y-6">
            {/* Company Name */}
            <div>
              <label htmlFor="supplierName" className="block text-sm font-medium text-gray-700">
                Název společnosti
              </label>
              <input
                type="text"
                id="supplierName"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                placeholder="Divadlo Studna s.r.o."
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            {/* IČO / DIČ */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="supplierIco" className="block text-sm font-medium text-gray-700">
                  IČO
                </label>
                <input
                  type="text"
                  id="supplierIco"
                  value={supplierIco}
                  onChange={(e) => setSupplierIco(e.target.value)}
                  placeholder="12345678"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="supplierDic" className="block text-sm font-medium text-gray-700">
                  DIČ
                </label>
                <input
                  type="text"
                  id="supplierDic"
                  value={supplierDic}
                  onChange={(e) => setSupplierDic(e.target.value)}
                  placeholder="CZ12345678"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label htmlFor="supplierStreet" className="block text-sm font-medium text-gray-700">
                Ulice
              </label>
              <input
                type="text"
                id="supplierStreet"
                value={supplierStreet}
                onChange={(e) => setSupplierStreet(e.target.value)}
                placeholder="Divadelní 123"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="supplierCity" className="block text-sm font-medium text-gray-700">
                  Město
                </label>
                <input
                  type="text"
                  id="supplierCity"
                  value={supplierCity}
                  onChange={(e) => setSupplierCity(e.target.value)}
                  placeholder="Praha"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="supplierZip" className="block text-sm font-medium text-gray-700">
                  PSČ
                </label>
                <input
                  type="text"
                  id="supplierZip"
                  value={supplierZip}
                  onChange={(e) => setSupplierZip(e.target.value)}
                  placeholder="110 00"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="supplierCountry"
                  className="block text-sm font-medium text-gray-700"
                >
                  Země
                </label>
                <input
                  type="text"
                  id="supplierCountry"
                  value={supplierCountry}
                  onChange={(e) => setSupplierCountry(e.target.value)}
                  placeholder="CZ"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            {/* Contact */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="supplierEmail" className="block text-sm font-medium text-gray-700">
                  E-mail
                </label>
                <input
                  type="email"
                  id="supplierEmail"
                  value={supplierEmail}
                  onChange={(e) => setSupplierEmail(e.target.value)}
                  placeholder="fakturace@divadlostudna.cz"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="supplierPhone" className="block text-sm font-medium text-gray-700">
                  Telefon
                </label>
                <input
                  type="tel"
                  id="supplierPhone"
                  value={supplierPhone}
                  onChange={(e) => setSupplierPhone(e.target.value)}
                  placeholder="+420 123 456 789"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            {/* Web */}
            <div>
              <label htmlFor="supplierWeb" className="block text-sm font-medium text-gray-700">
                Web
              </label>
              <input
                type="url"
                id="supplierWeb"
                value={supplierWeb}
                onChange={(e) => setSupplierWeb(e.target.value)}
                placeholder="https://www.divadlostudna.cz"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            {/* Bank Account */}
            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-sm font-medium text-gray-900 mb-4">Bankovní spojení</h4>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="supplierBankAccount"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Číslo účtu
                  </label>
                  <input
                    type="text"
                    id="supplierBankAccount"
                    value={supplierBankAccount}
                    onChange={(e) => setSupplierBankAccount(e.target.value)}
                    placeholder="123456789/0100"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="supplierIban"
                      className="block text-sm font-medium text-gray-700"
                    >
                      IBAN
                    </label>
                    <input
                      type="text"
                      id="supplierIban"
                      value={supplierIban}
                      onChange={(e) => setSupplierIban(e.target.value)}
                      placeholder="CZ65 0800 0000 1234 5678 9012"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="supplierBic"
                      className="block text-sm font-medium text-gray-700"
                    >
                      BIC/SWIFT
                    </label>
                    <input
                      type="text"
                      id="supplierBic"
                      value={supplierBic}
                      onChange={(e) => setSupplierBic(e.target.value)}
                      placeholder="GIBACZPX"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Text */}
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Texty na fakturách</h3>
            <p className="mt-1 text-sm text-gray-500">Doplňující texty zobrazené na fakturách</p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2 space-y-6">
            {/* Text Under Supplier */}
            <div>
              <label
                htmlFor="textUnderSupplier"
                className="block text-sm font-medium text-gray-700"
              >
                Text pod dodavatelem
              </label>
              <textarea
                id="textUnderSupplier"
                value={textUnderSupplier}
                onChange={(e) => setTextUnderSupplier(e.target.value)}
                rows={3}
                placeholder="např. Zapsáno v obchodním rejstříku vedeném..."
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            {/* Invoice Footer */}
            <div>
              <label
                htmlFor="textInvoiceFooter"
                className="block text-sm font-medium text-gray-700"
              >
                Patička faktury
              </label>
              <textarea
                id="textInvoiceFooter"
                value={textInvoiceFooter}
                onChange={(e) => setTextInvoiceFooter(e.target.value)}
                rows={3}
                placeholder="např. Děkujeme za spolupráci!"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Webhooks & Automation */}
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Webhooks & Automatizace</h3>
            <p className="mt-1 text-sm text-gray-500">
              Automatické aktualizace stavu faktur a notifikace o platbách
            </p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2 space-y-6">
            {/* Webhook URL Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Webhook URL</h4>
              <p className="text-sm text-blue-700 mb-2">
                Nastavte tento webhook ve Vyfakturuj pro automatické aktualizace:
              </p>
              <code className="block bg-white px-3 py-2 rounded text-sm font-mono text-blue-800 break-all">
                {typeof window !== 'undefined'
                  ? `${window.location.origin}/api/webhooks/vyfakturuj`
                  : '/api/webhooks/vyfakturuj'}
              </code>
            </div>

            {/* Webhook Secret */}
            <div>
              <label htmlFor="webhookSecret" className="block text-sm font-medium text-gray-700">
                Webhook Secret
              </label>
              <div className="mt-1 flex gap-2">
                <input
                  type="text"
                  id="webhookSecret"
                  value={webhookSecret}
                  onChange={(e) => setWebhookSecret(e.target.value)}
                  placeholder="Vygenerujte nebo zadejte secret"
                  className="block flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-mono"
                />
                <button
                  type="button"
                  onClick={handleGenerateSecret}
                  disabled={generatingSecret}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Generovat
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Secret pro ověření podpisu webhook požadavků. Nastavte stejný secret ve Vyfakturuj.
              </p>
            </div>

            {/* Auto Create Proforma */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="autoCreateProforma"
                checked={autoCreateProforma}
                onChange={(e) => setAutoCreateProforma(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="autoCreateProforma" className="text-sm text-gray-700">
                Automaticky vytvořit proforma fakturu při potvrzení objednávky
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Reminders */}
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Upomínky plateb</h3>
            <p className="mt-1 text-sm text-gray-500">
              Automatické odesílání upomínek pro nezaplacené faktury po splatnosti
            </p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2 space-y-6">
            {/* Enable Reminders */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="enableReminders"
                checked={enableReminders}
                onChange={(e) => setEnableReminders(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="enableReminders" className="text-sm text-gray-700 font-medium">
                Povolit automatické upomínky
              </label>
            </div>

            {enableReminders && (
              <>
                {/* Reminder 1 */}
                <div>
                  <label htmlFor="reminder1Days" className="block text-sm font-medium text-gray-700">
                    1. upomínka po (dnech po splatnosti)
                  </label>
                  <input
                    type="number"
                    id="reminder1Days"
                    value={reminder1Days}
                    onChange={(e) => setReminder1Days(parseInt(e.target.value) || 7)}
                    min={1}
                    max={90}
                    className="mt-1 block w-24 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                {/* Reminder 2 */}
                <div>
                  <label htmlFor="reminder2Days" className="block text-sm font-medium text-gray-700">
                    2. upomínka po (dnech po splatnosti)
                  </label>
                  <input
                    type="number"
                    id="reminder2Days"
                    value={reminder2Days}
                    onChange={(e) => setReminder2Days(parseInt(e.target.value) || 14)}
                    min={1}
                    max={120}
                    className="mt-1 block w-24 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                {/* Reminder 3 */}
                <div>
                  <label htmlFor="reminder3Days" className="block text-sm font-medium text-gray-700">
                    3. upomínka po (dnech po splatnosti)
                  </label>
                  <input
                    type="number"
                    id="reminder3Days"
                    value={reminder3Days}
                    onChange={(e) => setReminder3Days(parseInt(e.target.value) || 30)}
                    min={1}
                    max={180}
                    className="mt-1 block w-24 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    Upomínky se odesílají automaticky každý den v 8:00. Pro správnou funkci je nutné
                    mít nastaven CRON_SECRET v environment variables.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Ukládám...' : 'Uložit nastavení'}
        </button>
      </div>
    </form>
  )
}
