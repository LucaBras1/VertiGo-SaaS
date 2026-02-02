/**
 * Invoices List Page
 * Admin page for managing invoices
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  FileText,
  Plus,
  Search,
  Eye,
  Trash2,
  Calendar,
  Building2,
  DollarSign,
  Download,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import toast from 'react-hot-toast'

interface Invoice {
  id: string
  invoiceNumber: string
  status: string
  issueDate: string
  dueDate: string
  totalAmount: number
  paidAmount: number
  currency: string
  customer: {
    id: string
    firstName: string
    lastName: string
    organization: string | null
  }
  order: {
    id: string
    orderNumber: string
    sessionName: string | null
  } | null
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  sent: 'bg-blue-100 text-blue-700',
  paid: 'bg-emerald-100 text-emerald-700',
  overdue: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-500',
}

const statusLabels: Record<string, string> = {
  draft: 'Koncept',
  sent: 'Odesláno',
  paid: 'Zaplaceno',
  overdue: 'Po splatnosti',
  cancelled: 'Zrušeno',
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetchInvoices = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.append('status', statusFilter)

      const response = await fetch(`/api/invoices?${params}`)
      const data = await response.json()

      if (data.success) {
        setInvoices(data.data)
      } else {
        toast.error('Nepodařilo se načíst faktury')
      }
    } catch (error) {
      toast.error('Chyba při načítání faktur')
    } finally {
      setIsLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    fetchInvoices()
  }, [fetchInvoices])

  const handleDelete = async () => {
    if (!deleteId) return

    try {
      const response = await fetch(`/api/invoices/${deleteId}`, {
        method: 'DELETE',
      })
      const data = await response.json()

      if (data.success) {
        toast.success('Faktura byla smazána')
        fetchInvoices()
      } else {
        toast.error(data.error || 'Nepodařilo se smazat fakturu')
      }
    } catch (error) {
      toast.error('Chyba při mazání faktury')
    } finally {
      setDeleteId(null)
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount / 100)
  }

  const filteredInvoices = invoices.filter(invoice => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      invoice.invoiceNumber.toLowerCase().includes(searchLower) ||
      invoice.customer.firstName.toLowerCase().includes(searchLower) ||
      invoice.customer.lastName.toLowerCase().includes(searchLower) ||
      invoice.customer.organization?.toLowerCase().includes(searchLower)
    )
  })

  // Calculate totals
  const totals = invoices.reduce(
    (acc, inv) => {
      acc.total += inv.totalAmount
      if (inv.status === 'paid') acc.paid += inv.totalAmount
      if (inv.status === 'overdue') acc.overdue += inv.totalAmount
      return acc
    },
    { total: 0, paid: 0, overdue: 0 }
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Faktury</h1>
          <p className="text-gray-600 mt-2">Správa faktur a plateb</p>
        </div>
        <Link href="/admin/invoices/new">
          <Button>
            <Plus className="w-5 h-5 mr-2" />
            Nová faktura
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Celkem fakturováno</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(totals.total, 'CZK')}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Zaplaceno</p>
              <p className="text-2xl font-bold text-emerald-600">
                {formatCurrency(totals.paid, 'CZK')}
              </p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Po splatnosti</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(totals.overdue, 'CZK')}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Hledat faktury..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <div className="w-full md:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field"
            >
              <option value="">Všechny stavy</option>
              <option value="draft">Koncepty</option>
              <option value="sent">Odeslané</option>
              <option value="paid">Zaplacené</option>
              <option value="overdue">Po splatnosti</option>
              <option value="cancelled">Zrušené</option>
            </select>
          </div>
        </div>
      </div>

      {/* Invoices List */}
      {filteredInvoices.length === 0 ? (
        <div className="card text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Žádné faktury
          </h3>
          <p className="text-gray-600 mb-6">
            Zatím nemáte žádné faktury. Vytvořte první!
          </p>
          <Link href="/admin/invoices/new">
            <Button>
              <Plus className="w-5 h-5 mr-2" />
              Vytvořit fakturu
            </Button>
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Číslo faktury
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Zákazník
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Stav
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Splatnost
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                  Částka
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                  Akce
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((invoice) => (
                <tr
                  key={invoice.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-4 px-4">
                    <div className="font-semibold text-gray-900">
                      {invoice.invoiceNumber}
                    </div>
                    {invoice.order && (
                      <div className="text-xs text-gray-500">
                        {invoice.order.orderNumber}
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-900">
                          {invoice.customer.organization ||
                            `${invoice.customer.firstName} ${invoice.customer.lastName}`}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        statusColors[invoice.status]
                      }`}
                    >
                      {statusLabels[invoice.status]}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600">
                    {new Date(invoice.dueDate).toLocaleDateString('cs-CZ')}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="font-semibold text-gray-900">
                      {formatCurrency(invoice.totalAmount, invoice.currency)}
                    </div>
                    {invoice.status === 'paid' && (
                      <div className="text-xs text-emerald-600">Zaplaceno</div>
                    )}
                    {invoice.paidAmount > 0 &&
                      invoice.paidAmount < invoice.totalAmount && (
                        <div className="text-xs text-yellow-600">
                          Částečně: {formatCurrency(invoice.paidAmount, invoice.currency)}
                        </div>
                      )}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/invoices/${invoice.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      {invoice.status === 'draft' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteId(invoice.id)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Smazat fakturu"
        message="Opravdu chcete smazat tento koncept faktury? Tato akce je nevratná."
        confirmText="Smazat"
        variant="danger"
      />
    </div>
  )
}
