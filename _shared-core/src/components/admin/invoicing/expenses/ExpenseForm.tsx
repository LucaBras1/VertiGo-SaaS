'use client'

/**
 * Expense Form Component
 *
 * Form for creating and editing expenses
 */

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Save,
  Upload,
  Receipt,
  Calendar,
  Tag,
  Building2,
  FileText,
  AlertCircle,
  Loader2,
  X,
  Image,
} from 'lucide-react'
import {
  EXPENSE_CATEGORY_LABELS,
  CURRENCIES,
  formatAmount,
} from '@/types/invoicing'

interface ExpenseFormData {
  description: string
  amount: number
  currency: string
  category: string
  expenseDate: string
  supplier: string
  invoiceNumber: string
  taxDeductible: boolean
  vatDeductible: boolean
  vatAmount: number
  note: string
  receiptUrl: string | null
}

interface ExpenseFormProps {
  expense?: ExpenseFormData & { id: string }
  mode: 'create' | 'edit'
}

const DEFAULT_FORM_DATA: ExpenseFormData = {
  description: '',
  amount: 0,
  currency: 'CZK',
  category: 'OSTATNI',
  expenseDate: new Date().toISOString().split('T')[0],
  supplier: '',
  invoiceNumber: '',
  taxDeductible: true,
  vatDeductible: false,
  vatAmount: 0,
  note: '',
  receiptUrl: null,
}

export function ExpenseForm({ expense, mode }: ExpenseFormProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState<ExpenseFormData>(
    expense || DEFAULT_FORM_DATA
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [receiptPreview, setReceiptPreview] = useState<string | null>(
    expense?.receiptUrl || null
  )

  // Handle file upload
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      setError('Podporované formáty: obrázky a PDF')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Maximální velikost souboru je 5 MB')
      return
    }

    setUploading(true)
    setError(null)

    try {
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setReceiptPreview(e.target?.result as string)
        }
        reader.readAsDataURL(file)
      } else {
        setReceiptPreview(null)
      }

      // Upload file
      const formDataUpload = new FormData()
      formDataUpload.append('file', file)
      formDataUpload.append('type', 'expense-receipt')

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formDataUpload,
      })

      if (!res.ok) throw new Error('Chyba při nahrávání souboru')

      const data = await res.json()
      setFormData((prev) => ({ ...prev, receiptUrl: data.url }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba při nahrávání')
      setReceiptPreview(null)
    } finally {
      setUploading(false)
    }
  }

  // Remove receipt
  const handleRemoveReceipt = () => {
    setFormData((prev) => ({ ...prev, receiptUrl: null }))
    setReceiptPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      // Validate
      if (!formData.description.trim()) {
        throw new Error('Vyplňte popis nákladu')
      }

      if (!formData.amount || formData.amount <= 0) {
        throw new Error('Zadejte platnou částku')
      }

      const url =
        mode === 'create'
          ? '/api/admin/invoicing/expenses'
          : `/api/admin/invoicing/expenses/${expense!.id}`

      const res = await fetch(url, {
        method: mode === 'create' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Chyba při ukládání')
      }

      const savedExpense = await res.json()
      router.push(`/admin/invoicing/expenses/${savedExpense.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Neznámá chyba')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {mode === 'create' ? 'Nový náklad' : 'Upravit náklad'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {mode === 'create'
              ? 'Zaznamenejte nový výdaj'
              : `Upravujete náklad ${expense?.id}`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Zrušit
          </button>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Uložit
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
          {/* Basic Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-orange-600" />
              Základní údaje
            </h2>

            <div className="space-y-4">
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Popis nákladu *
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Např. Kancelářské potřeby, Cestovné..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Částka *
                  </label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        amount: parseFloat(e.target.value) || 0,
                      }))
                    }
                    min={0}
                    step={0.01}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    {CURRENCIES.map((curr) => (
                      <option key={curr.code} value={curr.code}>
                        {curr.code}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Kategorie
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, category: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    {Object.entries(EXPENSE_CATEGORY_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Datum nákladu
                </label>
                <input
                  type="date"
                  value={formData.expenseDate}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, expenseDate: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Supplier Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              Dodavatel
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Název dodavatele
                </label>
                <input
                  type="text"
                  value={formData.supplier}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, supplier: e.target.value }))
                  }
                  placeholder="Název firmy nebo osoby"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Číslo dokladu
                </label>
                <input
                  type="text"
                  value={formData.invoiceNumber}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, invoiceNumber: e.target.value }))
                  }
                  placeholder="Číslo faktury nebo účtenky"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Tax Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5 text-purple-600" />
              Daňové nastavení
            </h2>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.taxDeductible}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        taxDeductible: e.target.checked,
                      }))
                    }
                    className="rounded border-gray-300 dark:border-gray-600 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="text-gray-700 dark:text-gray-300">
                    Daňově uznatelný náklad
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.vatDeductible}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        vatDeductible: e.target.checked,
                      }))
                    }
                    className="rounded border-gray-300 dark:border-gray-600 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="text-gray-700 dark:text-gray-300">
                    Nárok na odpočet DPH
                  </span>
                </label>
              </div>

              {formData.vatDeductible && (
                <div className="max-w-xs">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    DPH k odpočtu
                  </label>
                  <input
                    type="number"
                    value={formData.vatAmount}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        vatAmount: parseFloat(e.target.value) || 0,
                      }))
                    }
                    min={0}
                    step={0.01}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Note */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Poznámka
            </h2>

            <textarea
              value={formData.note}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, note: e.target.value }))
              }
              rows={3}
              placeholder="Volitelná poznámka k nákladu..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Sidebar - Receipt Upload */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-600" />
              Účtenka / Doklad
            </h3>

            {/* Upload Area */}
            {!receiptPreview && !formData.receiptUrl ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-orange-500 dark:hover:border-orange-500 transition-colors"
              >
                {uploading ? (
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-orange-600" />
                ) : (
                  <>
                    <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Klikněte pro nahrání účtenky
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Obrázky nebo PDF, max. 5 MB
                    </p>
                  </>
                )}
              </div>
            ) : (
              <div className="relative">
                {receiptPreview ? (
                  <img
                    src={receiptPreview}
                    alt="Náhled účtenky"
                    className="w-full rounded-lg"
                  />
                ) : formData.receiptUrl ? (
                  <div className="flex items-center gap-2 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <FileText className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400 truncate flex-1">
                      Nahraný soubor
                    </span>
                  </div>
                ) : null}

                <button
                  type="button"
                  onClick={handleRemoveReceipt}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileSelect}
              className="hidden"
            />

            {formData.receiptUrl && (
              <a
                href={formData.receiptUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex items-center justify-center gap-2 w-full px-4 py-2 text-sm text-orange-600 hover:text-orange-700 border border-orange-200 dark:border-orange-800 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
              >
                <Image className="w-4 h-4" />
                Zobrazit v plné velikosti
              </a>
            )}
          </div>

          {/* Summary */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Souhrn
            </h4>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500 dark:text-gray-400">Částka:</dt>
                <dd className="font-medium text-gray-900 dark:text-white">
                  {formatAmount(formData.amount, formData.currency)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500 dark:text-gray-400">Kategorie:</dt>
                <dd className="text-gray-900 dark:text-white">
                  {EXPENSE_CATEGORY_LABELS[formData.category as keyof typeof EXPENSE_CATEGORY_LABELS]}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500 dark:text-gray-400">Daňově uznatelný:</dt>
                <dd className="text-gray-900 dark:text-white">
                  {formData.taxDeductible ? 'Ano' : 'Ne'}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </form>
  )
}
