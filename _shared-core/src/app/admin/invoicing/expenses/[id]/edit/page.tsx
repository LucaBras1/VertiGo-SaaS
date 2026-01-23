'use client'

/**
 * Edit Expense Page
 *
 * Edit an existing expense
 */

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { RefreshCw, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { ExpenseForm } from '@/components/admin/invoicing/expenses/ExpenseForm'

export default function EditExpensePage() {
  const params = useParams()
  const router = useRouter()
  const expenseId = params.id as string

  const [expense, setExpense] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

      // Transform data for form
      setExpense({
        id: data.id,
        description: data.description,
        amount: data.amount,
        currency: data.currency,
        category: data.category,
        expenseDate: data.expenseDate.split('T')[0],
        supplier: data.supplier || '',
        invoiceNumber: data.invoiceNumber || '',
        taxDeductible: data.taxDeductible,
        vatDeductible: data.vatDeductible,
        vatAmount: data.vatAmount || 0,
        note: data.note || '',
        receiptUrl: data.receiptUrl || null,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba při načítání')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Chyba
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
        <Link
          href={`/admin/invoicing/expenses/${expenseId}`}
          className="text-orange-600 hover:text-orange-700"
        >
          Zpět na detail nákladu
        </Link>
      </div>
    )
  }

  if (!expense) {
    return null
  }

  return <ExpenseForm expense={expense} mode="edit" />
}
