'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Filter, Download, Upload, Loader2, Receipt } from 'lucide-react'
import toast from 'react-hot-toast'
import { ExpenseFormModal } from '@/components/expenses/ExpenseFormModal'
import { ExpenseTable } from '@/components/expenses/ExpenseTable'

interface ExpenseCategory {
  id: string
  name: string
  description?: string | null
}

interface Expense {
  id: string
  description: string
  amount: number
  currency: string
  date: string
  categoryId: string
  category: ExpenseCategory
  vendor?: string | null
  taxAmount?: number | null
  isTaxDeductible: boolean
  status: string
  notes?: string | null
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [categories, setCategories] = useState<ExpenseCategory[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  })

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)

  // Fetch expenses
  const fetchExpenses = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(search && { search }),
        ...(categoryFilter && { categoryId: categoryFilter }),
        ...(statusFilter && { status: statusFilter }),
        ...(dateRange.startDate && { startDate: dateRange.startDate }),
        ...(dateRange.endDate && { endDate: dateRange.endDate }),
      })

      const response = await fetch(`/api/expenses?${params}`)
      if (!response.ok) throw new Error('Failed to fetch expenses')

      const data = await response.json()
      setExpenses(data.expenses)
      setCategories(data.categories)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Error fetching expenses:', error)
      toast.error('Chyba při načítání výdajů')
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.limit, search, categoryFilter, statusFilter, dateRange])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchExpenses()
    }, 300)
    return () => clearTimeout(timer)
  }, [fetchExpenses])

  // Create default categories if none exist
  const createDefaultCategories = async () => {
    try {
      const defaultCategories = [
        { name: 'Vybavení', description: 'Fitness vybavení a náčiní' },
        { name: 'Pronájem', description: 'Pronájem prostor' },
        { name: 'Marketing', description: 'Reklama a propagace' },
        { name: 'Software', description: 'Software a aplikace' },
        { name: 'Vzdělávání', description: 'Kurzy a certifikace' },
        { name: 'Doprava', description: 'Cestovné a doprava' },
        { name: 'Administrativa', description: 'Kancelářské potřeby' },
        { name: 'Ostatní', description: 'Ostatní výdaje' },
      ]

      for (const cat of defaultCategories) {
        await fetch('/api/expense-categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cat),
        })
      }

      toast.success('Výchozí kategorie byly vytvořeny')
      fetchExpenses()
    } catch (error) {
      console.error('Error creating categories:', error)
    }
  }

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/expenses/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete expense')
      toast.success('Výdaj byl smazán')
      fetchExpenses()
    } catch (error) {
      console.error('Error deleting expense:', error)
      toast.error('Chyba při mazání výdaje')
    }
  }

  // Handle edit
  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense)
    setIsModalOpen(true)
  }

  // Export CSV
  const exportCSV = () => {
    const headers = ['Datum', 'Popis', 'Kategorie', 'Dodavatel', 'Částka', 'DPH', 'Daňově uznatelný', 'Stav']
    const rows = expenses.map((exp) => [
      new Date(exp.date).toLocaleDateString('cs-CZ'),
      exp.description,
      exp.category.name,
      exp.vendor || '',
      exp.amount.toString(),
      exp.taxAmount?.toString() || '',
      exp.isTaxDeductible ? 'Ano' : 'Ne',
      exp.status,
    ])

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `vydaje-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
    toast.success('Export dokončen')
  }

  // Calculate totals
  const totals = expenses.reduce(
    (acc, exp) => ({
      total: acc.total + Number(exp.amount),
      taxDeductible: acc.taxDeductible + (exp.isTaxDeductible ? Number(exp.amount) : 0),
      vat: acc.vat + Number(exp.taxAmount || 0),
    }),
    { total: 0, taxDeductible: 0, vat: 0 }
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Výdaje</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">
            Evidujte a kategorizujte vaše firemní výdaje
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-2 px-4 py-2 text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-50 dark:bg-neutral-950 transition-colors"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
          <button
            onClick={() => {
              setEditingExpense(null)
              setIsModalOpen(true)
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Přidat výdaj
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm p-6 border border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Receipt className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Celkové výdaje</p>
              <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                {totals.total.toLocaleString('cs-CZ')} Kč
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm p-6 border border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Receipt className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Daňově uznatelné</p>
              <p className="text-xl font-bold text-emerald-600">
                {totals.taxDeductible.toLocaleString('cs-CZ')} Kč
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm p-6 border border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Receipt className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Celkem DPH</p>
              <p className="text-xl font-bold text-blue-600">
                {totals.vat.toLocaleString('cs-CZ')} Kč
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm p-4 border border-neutral-100 dark:border-neutral-800">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Hledat výdaje..."
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="w-full lg:w-48">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">Všechny kategorie</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="w-full lg:w-40">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">Všechny stavy</option>
              <option value="APPROVED">Schváleno</option>
              <option value="PENDING">Čeká</option>
              <option value="DRAFT">Koncept</option>
            </select>
          </div>

          {/* Date Range */}
          <div className="flex gap-2">
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, startDate: e.target.value }))
              }
              className="w-full lg:w-36 px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, endDate: e.target.value }))
              }
              className="w-full lg:w-36 px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Create categories if needed */}
      {categories.length === 0 && !loading && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
          <p className="text-amber-800">
            Nemáte žádné kategorie výdajů. Chcete vytvořit výchozí kategorie?
          </p>
          <button
            onClick={createDefaultCategories}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            Vytvořit kategorie
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-100 dark:border-neutral-800 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        ) : (
          <ExpenseTable
            expenses={expenses}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Zobrazeno {(pagination.page - 1) * pagination.limit + 1} -{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} z{' '}
            {pagination.total} výdajů
          </p>
          <div className="flex gap-2">
            <button
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
              }
              disabled={pagination.page === 1}
              className="px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50 dark:bg-neutral-950"
            >
              Předchozí
            </button>
            <button
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
              }
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50 dark:bg-neutral-950"
            >
              Další
            </button>
          </div>
        </div>
      )}

      {/* Expense Form Modal */}
      <ExpenseFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingExpense(null)
        }}
        onSuccess={fetchExpenses}
        expense={editingExpense}
        categories={categories}
      />
    </div>
  )
}
