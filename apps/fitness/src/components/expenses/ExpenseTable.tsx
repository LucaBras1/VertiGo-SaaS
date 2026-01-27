'use client'

import { Receipt, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface ExpenseCategory {
  id: string
  name: string
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

interface ExpenseTableProps {
  expenses: Expense[]
  onEdit: (expense: Expense) => void
  onDelete: (id: string) => void
}

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  DRAFT: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Koncept' },
  PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Čeká' },
  APPROVED: { bg: 'bg-green-100', text: 'text-green-700', label: 'Schváleno' },
  REJECTED: { bg: 'bg-red-100', text: 'text-red-700', label: 'Zamítnuto' },
  REIMBURSED: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Proplaceno' },
}

export function ExpenseTable({ expenses, onEdit, onDelete }: ExpenseTableProps) {
  if (expenses.length === 0) {
    return (
      <div className="text-center py-12">
        <Receipt className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Žádné výdaje</h3>
        <p className="mt-1 text-sm text-gray-500">
          Začněte přidáním prvního výdaje.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Popis
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Kategorie
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Datum
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Částka
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Daň. uznatelný
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Stav
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Akce
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {expenses.map((expense) => {
            const status = statusColors[expense.status] || statusColors.DRAFT
            return (
              <tr key={expense.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-emerald-100 rounded-lg">
                      <Receipt className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {expense.description}
                      </div>
                      {expense.vendor && (
                        <div className="text-sm text-gray-500">{expense.vendor}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {expense.category.name}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(expense.date).toLocaleDateString('cs-CZ')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                  {formatCurrency(Number(expense.amount))}
                  {expense.taxAmount && (
                    <div className="text-xs text-gray-500">
                      DPH: {formatCurrency(Number(expense.taxAmount))}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {expense.isTaxDeductible ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                  ) : (
                    <XCircle className="h-5 w-5 text-gray-300 mx-auto" />
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.text}`}
                  >
                    {status.label}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => onEdit(expense)}
                    className="text-emerald-600 hover:text-emerald-900 mr-3"
                    title="Upravit"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Opravdu chcete smazat tento výdaj?')) {
                        onDelete(expense.id)
                      }
                    }}
                    className="text-red-600 hover:text-red-900"
                    title="Smazat"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
