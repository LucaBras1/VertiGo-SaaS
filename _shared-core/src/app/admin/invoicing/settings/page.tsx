'use client'

/**
 * Invoicing Settings Page (NASTAVENÍ)
 *
 * Configure company info, number series, templates, and more
 */

import { useState, useEffect } from 'react'
import {
  Building2,
  Hash,
  FileText,
  Bell,
  Mail,
  CreditCard,
  Save,
  RefreshCw,
  AlertCircle,
  Loader2,
  Plus,
  Trash2,
  Edit,
  Check,
  X,
} from 'lucide-react'
import { DOCUMENT_TYPE_LABELS, CURRENCIES } from '@/types/invoicing'

interface CompanyInfo {
  name: string
  ico: string
  dic: string
  street: string
  city: string
  postalCode: string
  country: string
  email: string
  phone: string
  website: string
  bankAccount: string
  bankName: string
  iban: string
  swift: string
}

interface InvoicingSettings {
  defaultPaymentDays: number
  defaultCurrency: string
  defaultVatRate: number
  defaultFooterText: string
  isVatPayer: boolean
  vatTurnoverLimit: number
  reminderEnabled: boolean
  reminderDays1: number
  reminderDays2: number
  reminderDays3: number
}

interface NumberSeries {
  id: string
  name: string
  prefix: string
  pattern: string
  documentType: string
  currentNumber: number
  isDefault: boolean
}

type ActiveTab = 'company' | 'series' | 'templates' | 'reminders' | 'email'

export default function InvoicingSettingsPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('company')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Company Info
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    name: '',
    ico: '',
    dic: '',
    street: '',
    city: '',
    postalCode: '',
    country: 'Česká republika',
    email: '',
    phone: '',
    website: '',
    bankAccount: '',
    bankName: '',
    iban: '',
    swift: '',
  })

  // Invoicing Settings
  const [settings, setSettings] = useState<InvoicingSettings>({
    defaultPaymentDays: 14,
    defaultCurrency: 'CZK',
    defaultVatRate: 0,
    defaultFooterText: '',
    isVatPayer: false,
    vatTurnoverLimit: 2000000,
    reminderEnabled: true,
    reminderDays1: 7,
    reminderDays2: 14,
    reminderDays3: 30,
  })

  // Number Series
  const [numberSeries, setNumberSeries] = useState<NumberSeries[]>([])
  const [editingSeries, setEditingSeries] = useState<string | null>(null)
  const [newSeries, setNewSeries] = useState<Partial<NumberSeries> | null>(null)

  // Load data
  useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    setLoading(true)
    setError(null)

    try {
      const [settingsRes, seriesRes] = await Promise.all([
        fetch('/api/admin/invoicing/settings'),
        fetch('/api/admin/invoicing/number-series'),
      ])

      if (settingsRes.ok) {
        const data = await settingsRes.json()
        if (data.companyInfo) setCompanyInfo(data.companyInfo)
        if (data.settings) setSettings(data.settings)
      }

      if (seriesRes.ok) {
        const data = await seriesRes.json()
        setNumberSeries(data.series || data)
      }
    } catch (err) {
      setError('Chyba při načítání nastavení')
    } finally {
      setLoading(false)
    }
  }

  // Save company info
  const saveCompanyInfo = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const res = await fetch('/api/admin/invoicing/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyInfo }),
      })

      if (!res.ok) throw new Error('Chyba při ukládání')

      setSuccess('Údaje o firmě byly uloženy')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba při ukládání')
    } finally {
      setSaving(false)
    }
  }

  // Save invoicing settings
  const saveInvoicingSettings = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const res = await fetch('/api/admin/invoicing/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      })

      if (!res.ok) throw new Error('Chyba při ukládání')

      setSuccess('Nastavení bylo uloženo')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba při ukládání')
    } finally {
      setSaving(false)
    }
  }

  // Save number series
  const saveSeries = async (series: Partial<NumberSeries>, isNew: boolean) => {
    try {
      const url = isNew
        ? '/api/admin/invoicing/number-series'
        : `/api/admin/invoicing/number-series/${series.id}`

      const res = await fetch(url, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(series),
      })

      if (!res.ok) throw new Error('Chyba při ukládání')

      loadSettings()
      setEditingSeries(null)
      setNewSeries(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba při ukládání')
    }
  }

  // Delete number series
  const deleteSeries = async (id: string) => {
    if (!confirm('Opravdu chcete smazat tuto číselnou řadu?')) return

    try {
      const res = await fetch(`/api/admin/invoicing/number-series/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Chyba při mazání')

      loadSettings()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba při mazání')
    }
  }

  const TABS = [
    { id: 'company', label: 'Údaje o firmě', icon: Building2 },
    { id: 'series', label: 'Číselné řady', icon: Hash },
    { id: 'templates', label: 'Výchozí texty', icon: FileText },
    { id: 'reminders', label: 'Upomínky', icon: Bell },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Nastavení fakturace
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Konfigurujte firemní údaje, číselné řady a šablony
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
            <Check className="w-5 h-5" />
            <span>{success}</span>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar - Tabs */}
        <div className="lg:w-64 space-y-1">
          {TABS.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ActiveTab)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Company Info Tab */}
          {activeTab === 'company' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Údaje o firmě
              </h2>

              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Název firmy / Jméno
                    </label>
                    <input
                      type="text"
                      value={companyInfo.name}
                      onChange={(e) =>
                        setCompanyInfo((prev) => ({ ...prev, name: e.target.value }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      IČO
                    </label>
                    <input
                      type="text"
                      value={companyInfo.ico}
                      onChange={(e) =>
                        setCompanyInfo((prev) => ({ ...prev, ico: e.target.value }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      DIČ
                    </label>
                    <input
                      type="text"
                      value={companyInfo.dic}
                      onChange={(e) =>
                        setCompanyInfo((prev) => ({ ...prev, dic: e.target.value }))
                      }
                      placeholder="CZ12345678"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Adresa
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <input
                        type="text"
                        value={companyInfo.street}
                        onChange={(e) =>
                          setCompanyInfo((prev) => ({ ...prev, street: e.target.value }))
                        }
                        placeholder="Ulice a číslo"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <input
                        type="text"
                        value={companyInfo.city}
                        onChange={(e) =>
                          setCompanyInfo((prev) => ({ ...prev, city: e.target.value }))
                        }
                        placeholder="Město"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <input
                        type="text"
                        value={companyInfo.postalCode}
                        onChange={(e) =>
                          setCompanyInfo((prev) => ({ ...prev, postalCode: e.target.value }))
                        }
                        placeholder="PSČ"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Kontakt
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <input
                        type="email"
                        value={companyInfo.email}
                        onChange={(e) =>
                          setCompanyInfo((prev) => ({ ...prev, email: e.target.value }))
                        }
                        placeholder="Email"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <input
                        type="tel"
                        value={companyInfo.phone}
                        onChange={(e) =>
                          setCompanyInfo((prev) => ({ ...prev, phone: e.target.value }))
                        }
                        placeholder="Telefon"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <input
                        type="url"
                        value={companyInfo.website}
                        onChange={(e) =>
                          setCompanyInfo((prev) => ({ ...prev, website: e.target.value }))
                        }
                        placeholder="Web"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Bank Account */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Bankovní spojení
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Číslo účtu
                      </label>
                      <input
                        type="text"
                        value={companyInfo.bankAccount}
                        onChange={(e) =>
                          setCompanyInfo((prev) => ({ ...prev, bankAccount: e.target.value }))
                        }
                        placeholder="123456789/0100"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Název banky
                      </label>
                      <input
                        type="text"
                        value={companyInfo.bankName}
                        onChange={(e) =>
                          setCompanyInfo((prev) => ({ ...prev, bankName: e.target.value }))
                        }
                        placeholder="Komerční banka"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                        IBAN
                      </label>
                      <input
                        type="text"
                        value={companyInfo.iban}
                        onChange={(e) =>
                          setCompanyInfo((prev) => ({ ...prev, iban: e.target.value }))
                        }
                        placeholder="CZ6508000000192000145399"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                        SWIFT/BIC
                      </label>
                      <input
                        type="text"
                        value={companyInfo.swift}
                        onChange={(e) =>
                          setCompanyInfo((prev) => ({ ...prev, swift: e.target.value }))
                        }
                        placeholder="KOMBCZPP"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                  <button
                    onClick={saveCompanyInfo}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Uložit změny
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Number Series Tab */}
          {activeTab === 'series' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Číselné řady
                </h2>

                <button
                  onClick={() =>
                    setNewSeries({
                      name: '',
                      prefix: 'F',
                      pattern: '{PREFIX}{YEAR}-{NUMBER:4}',
                      documentType: 'FAKTURA',
                      currentNumber: 0,
                      isDefault: false,
                    })
                  }
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Nová řada
                </button>
              </div>

              {/* New Series Form */}
              {newSeries && (
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <h3 className="font-medium text-blue-700 dark:text-blue-400 mb-4">
                    Nová číselná řada
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Název
                      </label>
                      <input
                        type="text"
                        value={newSeries.name || ''}
                        onChange={(e) =>
                          setNewSeries((prev) => prev && { ...prev, name: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Prefix
                      </label>
                      <input
                        type="text"
                        value={newSeries.prefix || ''}
                        onChange={(e) =>
                          setNewSeries((prev) => prev && { ...prev, prefix: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Typ dokladu
                      </label>
                      <select
                        value={newSeries.documentType || 'FAKTURA'}
                        onChange={(e) =>
                          setNewSeries((prev) => prev && { ...prev, documentType: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        {Object.entries(DOCUMENT_TYPE_LABELS).map(([key, label]) => (
                          <option key={key} value={key}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-end gap-2">
                      <button
                        onClick={() => saveSeries(newSeries, true)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Check className="w-4 h-4" />
                        Vytvořit
                      </button>
                      <button
                        onClick={() => setNewSeries(null)}
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                        Zrušit
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Series List */}
              <div className="space-y-3">
                {numberSeries.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Hash className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    Zatím nemáte žádné číselné řady
                  </div>
                ) : (
                  numberSeries.map((series) => (
                    <div
                      key={series.id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {series.name}
                          </p>
                          {series.isDefault && (
                            <span className="px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full">
                              Výchozí
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Prefix: {series.prefix} · Pattern: {series.pattern} · Aktuální: {series.currentNumber}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          Pro: {DOCUMENT_TYPE_LABELS[series.documentType as keyof typeof DOCUMENT_TYPE_LABELS]}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingSeries(series.id)}
                          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteSeries(series.id)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Default Texts Tab */}
          {activeTab === 'templates' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Výchozí texty a nastavení
              </h2>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Výchozí splatnost (dny)
                    </label>
                    <input
                      type="number"
                      value={settings.defaultPaymentDays}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          defaultPaymentDays: parseInt(e.target.value) || 14,
                        }))
                      }
                      min={1}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Výchozí měna
                    </label>
                    <select
                      value={settings.defaultCurrency}
                      onChange={(e) =>
                        setSettings((prev) => ({ ...prev, defaultCurrency: e.target.value }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {CURRENCIES.map((curr) => (
                        <option key={curr.code} value={curr.code}>
                          {curr.code} - {curr.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Výchozí sazba DPH
                    </label>
                    <select
                      value={settings.defaultVatRate}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          defaultVatRate: parseInt(e.target.value),
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={0}>0% (neplátce)</option>
                      <option value={12}>12%</option>
                      <option value={21}>21%</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Výchozí text patičky faktury
                  </label>
                  <textarea
                    value={settings.defaultFooterText}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, defaultFooterText: e.target.value }))
                    }
                    rows={3}
                    placeholder="Např: Děkujeme za Vaši objednávku. V případě dotazů nás kontaktujte."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* VAT Settings */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <input
                      type="checkbox"
                      id="isVatPayer"
                      checked={settings.isVatPayer}
                      onChange={(e) =>
                        setSettings((prev) => ({ ...prev, isVatPayer: e.target.checked }))
                      }
                      className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                    />
                    <label
                      htmlFor="isVatPayer"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Jsem plátce DPH
                    </label>
                  </div>

                  {!settings.isVatPayer && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Limit obratu pro registraci k DPH (Kč)
                      </label>
                      <input
                        type="number"
                        value={settings.vatTurnoverLimit}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            vatTurnoverLimit: parseInt(e.target.value) || 2000000,
                          }))
                        }
                        className="w-full max-w-xs px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Budete upozorněni, když se přiblížíte k tomuto limitu
                      </p>
                    </div>
                  )}
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                  <button
                    onClick={saveInvoicingSettings}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Uložit změny
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Reminders Tab */}
          {activeTab === 'reminders' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Nastavení upomínek
              </h2>

              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="reminderEnabled"
                    checked={settings.reminderEnabled}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, reminderEnabled: e.target.checked }))
                    }
                    className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="reminderEnabled"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Automaticky odesílat upomínky
                  </label>
                </div>

                {settings.reminderEnabled && (
                  <div className="space-y-4 pl-6">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Upomínky se odesílají po splatnosti faktury:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          1. upomínka (dny)
                        </label>
                        <input
                          type="number"
                          value={settings.reminderDays1}
                          onChange={(e) =>
                            setSettings((prev) => ({
                              ...prev,
                              reminderDays1: parseInt(e.target.value) || 7,
                            }))
                          }
                          min={1}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          2. upomínka (dny)
                        </label>
                        <input
                          type="number"
                          value={settings.reminderDays2}
                          onChange={(e) =>
                            setSettings((prev) => ({
                              ...prev,
                              reminderDays2: parseInt(e.target.value) || 14,
                            }))
                          }
                          min={1}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          3. upomínka (dny)
                        </label>
                        <input
                          type="number"
                          value={settings.reminderDays3}
                          onChange={(e) =>
                            setSettings((prev) => ({
                              ...prev,
                              reminderDays3: parseInt(e.target.value) || 30,
                            }))
                          }
                          min={1}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Save Button */}
                <div className="flex justify-end">
                  <button
                    onClick={saveInvoicingSettings}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Uložit změny
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
