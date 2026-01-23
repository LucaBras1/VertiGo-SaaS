'use client'

/**
 * Expenses List Page (NÁKLADY)
 *
 * Displays all expenses with filters and management
 */

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Plus,
  Search,
  Download,
  Trash2,
  Receipt,
  MoreHorizontal,
  RefreshCw,
  Eye,
  Edit,
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  Upload,
  Calendar,
  Tag,
} from 'lucide-react'
import {
  EXPENSE_CATEGORY_LABELS,
  EXPENSE_STATUS_LABELS,
  formatAmount,
} from '@/types/invoicing'

interface ExpenseListItem {
  id: string
  description: string
  amount: number
  currency: string
  category: string
  status: string
  expenseDate: string
  supplier: string | null
  receiptUrl: string | null
  createdAt: string
}

interface PaginationInfo {
  total: number
  page: number
  limit: number
  totalPages: number
}

type ExpenseStatus = 'ALL' | 'PENDING' | 'APPROVED' | 'PAID' | 'REJECTED'
type ExpenseCategory = 'ALL' | 'CESTOVNE' | 'MATERIAL' | 'SLUZBY' | 'VYBAVENI' | 'OSTATNI'

const STATUS_TABS: { id: ExpenseStatus; label: string; icon: React.ElementType; color: string }[] = [
  { id: 'ALL', label: 'Všechny', icon: Receipt, color: 'text-gray-600' },
  { id: 'PENDING', label: 'Čekající', icon: Clock, color: 'text-yellow-600' },
  { id: 'APPROVED', label: 'Schválené', icon: CheckCircle2, color: 'text-blue-600' },
  { id: 'PAID', label: 'Uhrazené', icon: CheckCircle2, color: 'text-green-600' },
  { id: 'REJECTED', label: 'Zamítnuté', icon: AlertCircle, color: 'text-red-600' },
]

const CATEGORY_OPTIONS = [
  { id: 'ALL', label: 'Všechny kategorie' },
  ...Object.entries(EXPENSE_CATEGORY_LABELS).map(([key, label]) => ({ id: key, label })),
]

export default function ExpensesPage() {
  const router = useRouter()
  const [expenses, setExpenses] = useState<ExpenseListItem[]>([])
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [statusFilter, setStatusFilter] = useState<ExpenseStatus>('ALL')
  const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showActions, setShowActions] = useState<string | null>(null)

  // Totals
  const [totals, setTotals] = useState<{
    totalAmount: number
    pendingAmount: number
    approvedAmount: number
    paidAmount: number
  } | null>(null)

  // Fetch expenses
  const fetchExpenses = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })

      if (statusFilter !== 'ALL') params.set('status', statusFilter)
      if (categoryFilter !== 'ALL') params.set('category', categoryFilter)
      if (searchQuery) params.set('search', searchQuery)
      if (dateFrom) params.set('dateFrom', dateFrom)
      if (dateTo) params.set('dateTo', dateTo)

      const res = await fetch(`/api/admin/invoicing/expenses?${params}`)
      if (!res.ok) throw new Error('Chyba při načítání nákladů')

      const data = await res.json()
      setExpenses(data.expenses)
      setPagination(data.pagination)
      setTotals(data.totals)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Neznámá chyba')
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.limit, statusFilter, categoryFilter, searchQuery, dateFrom, dateTo])

  useEffect(() => {
    fetchExpenses()
  }, [fetchExpenses])

  // Handle actions
  const handleAction = async (expenseId: string, action: string) => {
    setShowActions(null)

    try {
      switch (action) {
        case 'view':
          router.push(`/admin/invoicing/expenses/${expenseId}`)
          break
        case 'edit':
          router.push(`/admin/invoicing/expenses/${expenseId}/edit`)
          break
        case 'approve':
          await fetch(`/api/admin/invoicing/expenses/${expenseId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'APPROVED' }),
          })
          fetchExpenses()
          break
        case 'markPaid':
          await fetch(`/api/admin/invoicing/expenses/${expenseId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'PAID', paidAt: new Date().toISOString() }),
          })
          fetchExpenses()
          break
        case 'reject':
          await fetch(`/api/admin/invoicing/expenses/${expenseId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'REJECTED' }),
          })
          fetchExpenses()
          break
        case 'delete':
          if (!confirm('Opravdu chcete smazat tento náklad?')) return
          await fetch(`/api/admin/invoicing/expenses/${expenseId}`, {
            method: 'DELETE',
          })
          fetchExpenses()
          break
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Chyba při provádění akce')
    }
  }

  // Toggle selection
  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedIds)
    if (newSelection.has(id)) {
      newSelection.delete(id)
    } else {
      newSelection.add(id)
    }
    setSelectedIds(newSelection)
  }

  const toggleAllSelection = () => {
    if (selectedIds.size === expenses.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(expenses.map((e) => e.id)))
    }
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    const config: Record<string, { bg: string; text: string }> = {
      PENDING: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400' },
      APPROVED: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400' },
      PAID: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400' },
      REJECTED: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400' },
    }
    const c = config[status] || config.PENDING
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${c.bg} ${c.text}`}>
        {EXPENSE_STATUS_LABELS[status as keyof typeof EXPENSE_STATUS_LABELS] || status}
      </span>
    )
  }

  // Get category badge
  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      CESTOVNE: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      MATERIAL: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      SLUZBY: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      VYBAVENI: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      OSTATNI: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    }
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[category] || colors.OSTATNI}`}>
        {EXPENSE_CATEGORY_LABELS[category as keyof typeof EXPENSE_CATEGORY_LABELS] || category}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Náklady</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Správa nákladů a výdajů
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchExpenses}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Obnovit
          </button>

          <Link
            href="/admin/invoicing/expenses/new"
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nový náklad
          </Link>
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

      {/* Summary Cards */}
      {totals && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Celkem nákladů</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatAmount(totals.totalAmount)}
            </p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800 p-4">
            <p className="text-sm text-yellow-600 dark:text-yellow-400">Čekající</p>
            <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
              {formatAmount(totals.pendingAmount)}
            </p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-4">
            <p className="text-sm text-blue-600 dark:text-blue-400">Schválené</p>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              {formatAmount(totals.approvedAmount)}
            </p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 p-4">
            <p className="text-sm text-green-600 dark:text-green-400">Uhrazené</p>
            <p className="text-2xl font-bold text-green-700 dark:text-green-300">
              {formatAmount(totals.paidAmount)}
            </p>
          </div>
        </div>
      )}

      {/* Status Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {STATUS_TABS.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => { setStatusFilter(tab.id); setPagination((p) => ({ ...p, page: 1 })) }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                statusFilter === tab.id
                  ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Icon className={`w-4 h-4 ${tab.color}`} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Hledat podle popisu, dodavatele..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Category */}
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value as ExpenseCategory); setPagination((p) => ({ ...p, page: 1 })) }}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>{opt.label}</option>
            ))}
          </select>

          {/* Date Range */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <span className="text-gray-500">-</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Clear Filters */}
          {(searchQuery || categoryFilter !== 'ALL' || dateFrom || dateTo) && (
            <button
              onClick={() => {
                setSearchQuery('')
                setCategoryFilter('ALL')
                setDateFrom('')
                setDateTo('')
              }}
              className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              Vymazat filtry
            </button>
          )}
        </div>
      </div>

      {/* Expense Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === expenses.length && expenses.length > 0}
                    onChange={toggleAllSelection}
                    className="rounded border-gray-300 dark:border-gray-600"
                  />
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">
                  Popis
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">
                  Kategorie
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">
                  Dodavatel
                </th>
                <th className="text-right px-4 py-3 font-medium text-gray-500 dark:text-gray-400">
                  Částka
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">
                  Datum
                </th>
                <th className="text-center px-4 py-3 font-medium text-gray-500 dark:text-gray-400">
                  Stav
                </th>
                <th className="text-center px-4 py-3 font-medium text-gray-500 dark:text-gray-400">
                  Účtenka
                </th>
                <th className="w-12 px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Načítám náklady...
                  </td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                    <Receipt className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    Žádné náklady nenalezeny
                  </td>
                </tr>
              ) : (
                expenses.map((expense) => (
                  <tr
                    key={expense.id}
                    className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                    onClick={() => router.push(`/admin/invoicing/expenses/${expense.id}`)}
                  >
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(expense.id)}
                        onChange={() => toggleSelection(expense.id)}
                        className="rounded border-gray-300 dark:border-gray-600"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {expense.description}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {getCategoryBadge(expense.category)}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      {expense.supplier || '-'}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">
                      {formatAmount(expense.amount, expense.currency)}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      {new Date(expense.expenseDate).toLocaleDateString('cs-CZ')}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {getStatusBadge(expense.status)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {expense.receiptUrl ? (
                        <FileText className="w-5 h-5 text-green-600 mx-auto" />
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="relative">
                        <button
                          onClick={() => setShowActions(showActions === expense.id ? null : expense.id)}
                          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600"
                        >
                          <MoreHorizontal className="w-5 h-5 text-gray-500" />
                        </button>

                        {showActions === expense.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                            <button
                              onClick={() => handleAction(expense.id, 'view')}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <Eye className="w-4 h-4" />
                              Zobrazit
                            </button>
                            <button
                              onClick={() => handleAction(expense.id, 'edit')}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <Edit className="w-4 h-4" />
                              Upravit
                            </button>
                            <hr className="my-1 border-gray-200 dark:border-gray-700" />
                            {expense.status === 'PENDING' && (
                              <>
                                <button
                                  onClick={() => handleAction(expense.id, 'approve')}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                  Schválit
                                </button>
                                <button
                                  onClick={() => handleAction(expense.id, 'reject')}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                  <AlertCircle className="w-4 h-4" />
                                  Zamítnout
                                </button>
                              </>
                            )}
                            {expense.status === 'APPROVED' && (
                              <button
                                onClick={() => handleAction(expense.id, 'markPaid')}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                Uhrazeno
                              </button>
                            )}
                            <hr className="my-1 border-gray-200 dark:border-gray-700" />
                            <button
                              onClick={() => handleAction(expense.id, 'delete')}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="w-4 h-4" />
                              Smazat
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Zobrazeno {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} z {pagination.total}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                disabled={pagination.page <= 1}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Předchozí
              </button>

              <span className="text-sm text-gray-600 dark:text-gray-400">
                Strana {pagination.page} z {pagination.totalPages}
              </span>

              <button
                onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                disabled={pagination.page >= pagination.totalPages}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Další
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
