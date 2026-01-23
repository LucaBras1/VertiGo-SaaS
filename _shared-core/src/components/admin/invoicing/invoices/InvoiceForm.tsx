'use client'

/**
 * Invoice Form Component
 *
 * Full form for creating and editing invoices
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Save,
  Send,
  Eye,
  FileText,
  Building2,
  User,
  Calendar,
  CreditCard,
  MessageSquare,
  AlertCircle,
  Loader2,
  ChevronDown,
  Search,
} from 'lucide-react'
import { InvoiceItemsEditor, InvoiceItem } from './InvoiceItemsEditor'
import {
  DOCUMENT_TYPE_LABELS,
  PAYMENT_METHOD_LABELS,
  CURRENCIES,
  formatAmount,
} from '@/types/invoicing'

interface Customer {
  id: string
  name: string
  email: string | null
  phone: string | null
  company: string | null
  ico: string | null
  dic: string | null
  street: string | null
  city: string | null
  postalCode: string | null
  country: string | null
}

interface NumberSeries {
  id: string
  name: string
  prefix: string
  documentType: string
}

interface InvoiceTemplate {
  id: string
  name: string
  isDefault: boolean
}

interface InvoiceFormData {
  documentType: string
  customerId: string | null
  numberSeriesId: string | null
  templateId: string | null
  issueDate: string
  dueDate: string
  taxableSupplyDate: string
  paymentMethod: string
  currency: string
  bankAccount: string
  variableSymbol: string
  constantSymbol: string
  specificSymbol: string
  orderNumber: string
  note: string
  internalNote: string
  headerText: string
  footerText: string
  items: InvoiceItem[]
}

interface InvoiceFormProps {
  invoice?: InvoiceFormData & { id: string }
  mode: 'create' | 'edit'
}

const DEFAULT_FORM_DATA: InvoiceFormData = {
  documentType: 'FAKTURA',
  customerId: null,
  numberSeriesId: null,
  templateId: null,
  issueDate: new Date().toISOString().split('T')[0],
  dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  taxableSupplyDate: new Date().toISOString().split('T')[0],
  paymentMethod: 'BANK_TRANSFER',
  currency: 'CZK',
  bankAccount: '',
  variableSymbol: '',
  constantSymbol: '',
  specificSymbol: '',
  orderNumber: '',
  note: '',
  internalNote: '',
  headerText: '',
  footerText: '',
  items: [
    {
      description: '',
      quantity: 1,
      unit: 'ks',
      unitPrice: 0,
      vatRate: 0,
      discount: 0,
      discountType: 'PERCENTAGE',
      totalWithoutVat: 0,
      vatAmount: 0,
      totalWithVat: 0,
    },
  ],
}

export function InvoiceForm({ invoice, mode }: InvoiceFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState<InvoiceFormData>(
    invoice || DEFAULT_FORM_DATA
  )
  const [customers, setCustomers] = useState<Customer[]>([])
  const [numberSeries, setNumberSeries] = useState<NumberSeries[]>([])
  const [templates, setTemplates] = useState<InvoiceTemplate[]>([])
  const [settings, setSettings] = useState<{
    defaultBankAccount?: string
    defaultPaymentDays?: number
    defaultCurrency?: string
    defaultFooterText?: string
  } | null>(null)

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customerSearch, setCustomerSearch] = useState('')
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)

  const [saving, setSaving] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'items' | 'details' | 'notes'>('items')

  // Load initial data
  useEffect(() => {
    loadInitialData()
  }, [])

  // Update due date when issue date or settings change
  useEffect(() => {
    if (settings?.defaultPaymentDays && mode === 'create') {
      const issueDate = new Date(formData.issueDate)
      const dueDate = new Date(issueDate.getTime() + settings.defaultPaymentDays * 24 * 60 * 60 * 1000)
      setFormData((prev) => ({
        ...prev,
        dueDate: dueDate.toISOString().split('T')[0],
      }))
    }
  }, [formData.issueDate, settings?.defaultPaymentDays, mode])

  async function loadInitialData() {
    try {
      const [customersRes, seriesRes, templatesRes, settingsRes] = await Promise.all([
        fetch('/api/admin/customers?limit=100'),
        fetch('/api/admin/invoicing/number-series'),
        fetch('/api/admin/invoicing/templates'),
        fetch('/api/admin/invoicing/settings'),
      ])

      if (customersRes.ok) {
        const data = await customersRes.json()
        setCustomers(data.customers || data)
      }

      if (seriesRes.ok) {
        const data = await seriesRes.json()
        setNumberSeries(data.series || data)
      }

      if (templatesRes.ok) {
        const data = await templatesRes.json()
        setTemplates(data.templates || data)
      }

      if (settingsRes.ok) {
        const data = await settingsRes.json()
        setSettings(data)

        // Apply default settings for new invoices
        if (mode === 'create') {
          setFormData((prev) => ({
            ...prev,
            bankAccount: data.defaultBankAccount || prev.bankAccount,
            currency: data.defaultCurrency || prev.currency,
            footerText: data.defaultFooterText || prev.footerText,
          }))
        }
      }

      // Load selected customer if editing
      if (invoice?.customerId) {
        const customer = customers.find((c) => c.id === invoice.customerId)
        if (customer) setSelectedCustomer(customer)
      }
    } catch (err) {
      console.error('Failed to load initial data:', err)
    }
  }

  // Handle customer selection
  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer)
    setFormData((prev) => ({ ...prev, customerId: customer.id }))
    setShowCustomerDropdown(false)
    setCustomerSearch('')
  }

  // Filter customers based on search
  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.email?.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.company?.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.ico?.includes(customerSearch)
  )

  // Calculate totals
  const totals = formData.items.reduce(
    (acc, item) => ({
      subtotal: acc.subtotal + (item.totalWithoutVat || 0),
      vat: acc.vat + (item.vatAmount || 0),
      total: acc.total + (item.totalWithVat || 0),
    }),
    { subtotal: 0, vat: 0, total: 0 }
  )

  // Handle form submission
  const handleSubmit = async (action: 'save' | 'saveAndSend') => {
    if (action === 'save') {
      setSaving(true)
    } else {
      setSending(true)
    }
    setError(null)

    try {
      // Validate
      if (!selectedCustomer && !formData.customerId) {
        throw new Error('Vyberte zákazníka')
      }

      if (formData.items.length === 0) {
        throw new Error('Přidejte alespoň jednu položku')
      }

      if (formData.items.some((item) => !item.description.trim())) {
        throw new Error('Vyplňte popis všech položek')
      }

      const payload = {
        ...formData,
        totalWithoutVat: totals.subtotal,
        vatAmount: totals.vat,
        totalAmount: totals.total,
      }

      const url =
        mode === 'create'
          ? '/api/admin/invoicing/invoices'
          : `/api/admin/invoicing/invoices/${invoice!.id}`

      const res = await fetch(url, {
        method: mode === 'create' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Chyba při ukládání')
      }

      const savedInvoice = await res.json()

      // Send if requested
      if (action === 'saveAndSend') {
        const sendRes = await fetch(
          `/api/admin/invoicing/invoices/${savedInvoice.id}?action=send`,
          { method: 'POST' }
        )
        if (!sendRes.ok) {
          throw new Error('Faktura byla uložena, ale odeslání selhalo')
        }
      }

      router.push(`/admin/invoicing/invoices/${savedInvoice.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Neznámá chyba')
    } finally {
      setSaving(false)
      setSending(false)
    }
  }

  // Handle preview
  const handlePreview = () => {
    // Save to session storage and open preview
    sessionStorage.setItem('invoicePreview', JSON.stringify(formData))
    window.open('/admin/invoicing/invoices/preview', '_blank')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {mode === 'create' ? 'Nová faktura' : 'Upravit fakturu'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {mode === 'create'
              ? 'Vytvořte nový daňový doklad'
              : `Upravujete fakturu ${invoice?.id}`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePreview}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Eye className="w-4 h-4" />
            Náhled
          </button>

          <button
            onClick={() => handleSubmit('save')}
            disabled={saving || sending}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Uložit
          </button>

          <button
            onClick={() => handleSubmit('saveAndSend')}
            disabled={saving || sending}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Uložit a odeslat
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Document Type & Basic Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Základní údaje
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Document Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Typ dokladu
                </label>
                <select
                  value={formData.documentType}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, documentType: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {Object.entries(DOCUMENT_TYPE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Number Series */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Číselná řada
                </label>
                <select
                  value={formData.numberSeriesId || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      numberSeriesId: e.target.value || null,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Automaticky</option>
                  {numberSeries
                    .filter(
                      (s) =>
                        s.documentType === formData.documentType ||
                        s.documentType === 'ALL'
                    )
                    .map((series) => (
                      <option key={series.id} value={series.id}>
                        {series.name} ({series.prefix})
                      </option>
                    ))}
                </select>
              </div>

              {/* Template */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Šablona
                </label>
                <select
                  value={formData.templateId || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      templateId: e.target.value || null,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Výchozí</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                      {template.isDefault ? ' (výchozí)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Currency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Měna
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, currency: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {CURRENCIES.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.code} - {currency.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Customer Selection */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-green-600" />
              Odběratel
            </h2>

            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Hledat zákazníka..."
                  value={customerSearch}
                  onChange={(e) => {
                    setCustomerSearch(e.target.value)
                    setShowCustomerDropdown(true)
                  }}
                  onFocus={() => setShowCustomerDropdown(true)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {showCustomerDropdown && filteredCustomers.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredCustomers.map((customer) => (
                    <button
                      key={customer.id}
                      onClick={() => handleCustomerSelect(customer)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <p className="font-medium text-gray-900 dark:text-white">
                        {customer.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {customer.email}
                        {customer.ico && ` | IČO: ${customer.ico}`}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedCustomer && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {selectedCustomer.name}
                    </p>
                    {selectedCustomer.company && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedCustomer.company}
                      </p>
                    )}
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {[
                        selectedCustomer.street,
                        selectedCustomer.city,
                        selectedCustomer.postalCode,
                      ]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                      {selectedCustomer.ico && <span>IČO: {selectedCustomer.ico}</span>}
                      {selectedCustomer.dic && <span>DIČ: {selectedCustomer.dic}</span>}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedCustomer(null)
                      setFormData((prev) => ({ ...prev, customerId: null }))
                    }}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Změnit
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Dates */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              Datumy
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Datum vystavení
                </label>
                <input
                  type="date"
                  value={formData.issueDate}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, issueDate: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Datum splatnosti
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, dueDate: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  DUZP
                </label>
                <input
                  type="date"
                  value={formData.taxableSupplyDate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      taxableSupplyDate: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Tabs for Items/Details/Notes */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <div className="flex">
                {[
                  { id: 'items', label: 'Položky', icon: FileText },
                  { id: 'details', label: 'Platební údaje', icon: CreditCard },
                  { id: 'notes', label: 'Poznámky', icon: MessageSquare },
                ].map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as 'items' | 'details' | 'notes')}
                      className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === tab.id
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="p-6">
              {activeTab === 'items' && (
                <InvoiceItemsEditor
                  items={formData.items}
                  onChange={(items) => setFormData((prev) => ({ ...prev, items }))}
                  currency={formData.currency}
                />
              )}

              {activeTab === 'details' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Způsob platby
                      </label>
                      <select
                        value={formData.paymentMethod}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            paymentMethod: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {Object.entries(PAYMENT_METHOD_LABELS).map(([key, label]) => (
                          <option key={key} value={key}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Číslo bankovního účtu
                      </label>
                      <input
                        type="text"
                        value={formData.bankAccount}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            bankAccount: e.target.value,
                          }))
                        }
                        placeholder="123456789/0100"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Variabilní symbol
                      </label>
                      <input
                        type="text"
                        value={formData.variableSymbol}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            variableSymbol: e.target.value,
                          }))
                        }
                        placeholder="Automaticky z čísla faktury"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Konstantní symbol
                      </label>
                      <input
                        type="text"
                        value={formData.constantSymbol}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            constantSymbol: e.target.value,
                          }))
                        }
                        placeholder="0308"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Číslo objednávky
                      </label>
                      <input
                        type="text"
                        value={formData.orderNumber}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            orderNumber: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notes' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Text před položkami
                    </label>
                    <textarea
                      value={formData.headerText}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, headerText: e.target.value }))
                      }
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Text za položkami (patička)
                    </label>
                    <textarea
                      value={formData.footerText}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, footerText: e.target.value }))
                      }
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Poznámka pro zákazníka
                    </label>
                    <textarea
                      value={formData.note}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, note: e.target.value }))
                      }
                      rows={3}
                      placeholder="Viditelná na faktuře"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Interní poznámka
                    </label>
                    <textarea
                      value={formData.internalNote}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          internalNote: e.target.value,
                        }))
                      }
                      rows={2}
                      placeholder="Není viditelná na faktuře"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar - Summary */}
        <div className="space-y-6">
          {/* Total Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Souhrn
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Základ:</span>
                <span>{formatAmount(totals.subtotal, formData.currency)}</span>
              </div>

              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>DPH:</span>
                <span>{formatAmount(totals.vat, formData.currency)}</span>
              </div>

              <hr className="border-gray-200 dark:border-gray-700" />

              <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-white">
                <span>Celkem:</span>
                <span className="text-blue-600 dark:text-blue-400">
                  {formatAmount(totals.total, formData.currency)}
                </span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">Typ dokladu:</dt>
                  <dd className="text-gray-900 dark:text-white">
                    {DOCUMENT_TYPE_LABELS[formData.documentType as keyof typeof DOCUMENT_TYPE_LABELS]}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">Položek:</dt>
                  <dd className="text-gray-900 dark:text-white">{formData.items.length}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">Splatnost:</dt>
                  <dd className="text-gray-900 dark:text-white">
                    {new Date(formData.dueDate).toLocaleDateString('cs-CZ')}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Tip
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Po uložení faktury ji můžete odeslat zákazníkovi emailem nebo stáhnout jako PDF.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
