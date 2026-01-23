'use client'

/**
 * Expense Detail Page
 *
 * View and manage a single expense
 */

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Receipt,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Calendar,
  Tag,
  Building2,
  FileText,
  RefreshCw,
  Loader2,
  ExternalLink,
} from 'lucide-react'
import {
  EXPENSE_CATEGORY_LABELS,
  EXPENSE_STATUS_LABELS,
  formatAmount,
} from '@/types/invoicing'

interface ExpenseDetail {
  id: string
  description: string
  amount: number
  currency: string
  category: string
  status: string
  expenseDate: string
  supplier: string | null
  invoiceNumber: string | null
  taxDeductible: boolean
  vatDeductible: boolean
  vatAmount: number
  note: string | null
  receiptUrl: string | null
  paidAt: string | null
  createdAt: string
  updatedAt: string
}

export default function ExpenseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const expenseId = params.id as string

  const [expense, setExpense] = useState<ExpenseDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchExpense()
  }, [expenseId])

  async function fetchExpense() {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/admin/invoicing/expenses/${expenseId}`)
      if (!res.ok) throw new Error('Náklad nenalezen')

      const data = await res.json()
      setExpense(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba při načítání')
    } finally {
      setLoading(false)
    }
  }

  // Handle actions
  const handleAction = async (action: string) => {
    setActionLoading(action)

    try {
      switch (action) {
        case 'approve':
          await fetch(`/api/admin/invoicing/expenses/${expenseId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'APPROVED' }),
          })
          break

        case 'markPaid':
          await fetch(`/api/admin/invoicing/expenses/${expenseId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'PAID', paidAt: new Date().toISOString() }),
          })
          break

        case 'reject':
          await fetch(`/api/admin/invoicing/expenses/${expenseId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'REJECTED' }),
          })
          break

        case 'delete':
          if (!confirm('Opravdu chcete smazat tento náklad?')) {
            setActionLoading(null)
            return
          }
          await fetch(`/api/admin/invoicing/expenses/${expenseId}`, {
            method: 'DELETE',
          })
          router.push('/admin/invoicing/expenses')
          return
      }

      fetchExpense()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Chyba při provádění akce')
    } finally {
      setActionLoading(null)
    }
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    const config: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
      PENDING: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', icon: Clock },
      APPROVED: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', icon: CheckCircle2 },
      PAID: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', icon: CheckCircle2 },
      REJECTED: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', icon: XCircle },
    }
    const c = config[status] || config.PENDING
    const Icon = c.icon
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full ${c.bg} ${c.text}`}>
        <Icon className="w-4 h-4" />
        {EXPENSE_STATUS_LABELS[status as keyof typeof EXPENSE_STATUS_LABELS] || status}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    )
  }

  if (error || !expense) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Chyba
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-4">{error || 'Náklad nenalezen'}</p>
        <Link
          href="/admin/invoicing/expenses"
          className="text-orange-600 hover:text-orange-700"
        >
          Zpět na seznam nákladů
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/invoicing/expenses"
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {expense.description}
              </h1>
              {getStatusBadge(expense.status)}
            </div>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {EXPENSE_CATEGORY_LABELS[expense.category as keyof typeof EXPENSE_CATEGORY_LABELS]}
              {' · '}
              {new Date(expense.expenseDate).toLocaleDateString('cs-CZ')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Edit */}
          <Link
            href={`/admin/invoicing/expenses/${expense.id}/edit`}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Upravit
          </Link>

          {/* Status Actions */}
          {expense.status === 'PENDING' && (
            <>
              <button
                onClick={() => handleAction('approve')}
                disabled={actionLoading === 'approve'}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {actionLoading === 'approve' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                Schválit
              </button>

              <button
                onClick={() => handleAction('reject')}
                disabled={actionLoading === 'reject'}
                className="flex items-center gap-2 px-4 py-2 text-red-700 dark:text-red-400 bg-white dark:bg-gray-800 border border-red-300 dark:border-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
              >
                {actionLoading === 'reject' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                Zamítnout
              </button>
            </>
          )}

          {expense.status === 'APPROVED' && (
            <button
              onClick={() => handleAction('markPaid')}
              disabled={actionLoading === 'markPaid'}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {actionLoading === 'markPaid' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              Označit jako uhrazeno
            </button>
          )}

          {/* Delete */}
          <button
            onClick={() => handleAction('delete')}
            disabled={actionLoading === 'delete'}
            className="flex items-center gap-2 px-4 py-2 text-red-700 dark:text-red-400 bg-white dark:bg-gray-800 border border-red-300 dark:border-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
          >
            {actionLoading === 'delete' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            Smazat
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-orange-600" />
              Základní údaje
            </h2>

            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-gray-500 dark:text-gray-400">Popis</dt>
                <dd className="mt-1 text-gray-900 dark:text-white font-medium">
                  {expense.description}
                </dd>
              </div>

              <div>
                <dt className="text-sm text-gray-500 dark:text-gray-400">Částka</dt>
                <dd className="mt-1 text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {formatAmount(expense.amount, expense.currency)}
                </dd>
              </div>

              <div>
                <dt className="text-sm text-gray-500 dark:text-gray-400">Kategorie</dt>
                <dd className="mt-1 text-gray-900 dark:text-white">
                  {EXPENSE_CATEGORY_LABELS[expense.category as keyof typeof EXPENSE_CATEGORY_LABELS]}
                </dd>
              </div>

              <div>
                <dt className="text-sm text-gray-500 dark:text-gray-400">Datum nákladu</dt>
                <dd className="mt-1 text-gray-900 dark:text-white">
                  {new Date(expense.expenseDate).toLocaleDateString('cs-CZ')}
                </dd>
              </div>
            </dl>
          </div>

          {/* Supplier Info */}
          {(expense.supplier || expense.invoiceNumber) && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                Dodavatel
              </h2>

              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {expense.supplier && (
                  <div>
                    <dt className="text-sm text-gray-500 dark:text-gray-400">Název dodavatele</dt>
                    <dd className="mt-1 text-gray-900 dark:text-white">
                      {expense.supplier}
                    </dd>
                  </div>
                )}

                {expense.invoiceNumber && (
                  <div>
                    <dt className="text-sm text-gray-500 dark:text-gray-400">Číslo dokladu</dt>
                    <dd className="mt-1 text-gray-900 dark:text-white font-mono">
                      {expense.invoiceNumber}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          {/* Tax Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5 text-purple-600" />
              Daňové údaje
            </h2>

            <dl className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <dt className="text-sm text-gray-500 dark:text-gray-400">Daňově uznatelný</dt>
                <dd className={`mt-1 font-medium ${expense.taxDeductible ? 'text-green-600' : 'text-gray-500'}`}>
                  {expense.taxDeductible ? 'Ano' : 'Ne'}
                </dd>
              </div>

              <div>
                <dt className="text-sm text-gray-500 dark:text-gray-400">Nárok na odpočet DPH</dt>
                <dd className={`mt-1 font-medium ${expense.vatDeductible ? 'text-green-600' : 'text-gray-500'}`}>
                  {expense.vatDeductible ? 'Ano' : 'Ne'}
                </dd>
              </div>

              {expense.vatDeductible && expense.vatAmount > 0 && (
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">DPH k odpočtu</dt>
                  <dd className="mt-1 font-medium text-gray-900 dark:text-white">
                    {formatAmount(expense.vatAmount, expense.currency)}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Note */}
          {expense.note && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Poznámka
              </h2>
              <p className="text-gray-600 dark:text-gray-400">{expense.note}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Receipt */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-600" />
              Účtenka / Doklad
            </h3>

            {expense.receiptUrl ? (
              <div className="space-y-4">
                {expense.receiptUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                  <img
                    src={expense.receiptUrl}
                    alt="Účtenka"
                    className="w-full rounded-lg"
                  />
                ) : (
                  <div className="flex items-center gap-2 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <FileText className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Nahraný soubor
                    </span>
                  </div>
                )}

                <a
                  href={expense.receiptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-4 py-2 text-sm text-orange-600 hover:text-orange-700 border border-orange-200 dark:border-orange-800 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Otevřít v novém okně
                </a>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Žádná účtenka</p>
              </div>
            )}
          </div>

          {/* Status Timeline */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              Časová osa
            </h3>

            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500 dark:text-gray-400">Vytvořeno:</dt>
                <dd className="text-gray-900 dark:text-white">
                  {new Date(expense.createdAt).toLocaleString('cs-CZ')}
                </dd>
              </div>

              {expense.updatedAt !== expense.createdAt && (
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">Upraveno:</dt>
                  <dd className="text-gray-900 dark:text-white">
                    {new Date(expense.updatedAt).toLocaleString('cs-CZ')}
                  </dd>
                </div>
              )}

              {expense.paidAt && (
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">Uhrazeno:</dt>
                  <dd className="text-green-600 dark:text-green-400">
                    {new Date(expense.paidAt).toLocaleString('cs-CZ')}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}
