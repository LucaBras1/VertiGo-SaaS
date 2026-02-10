'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Search, FileText, Clock, CheckCircle, AlertCircle, XCircle, DollarSign } from 'lucide-react'
import { Badge, Button, Card, Input } from '@vertigo/ui'
interface Invoice {
  id: string
  invoiceNumber: string
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED'
  subtotal: number
  tax: number
  total: number
  dueDate: string | null
  paidAt: string | null
  createdAt: string
  client: {
    name: string
    email: string
  }
  package: {
    title: string
  } | null
}

const statusConfig = {
  DRAFT: { label: 'Draft', color: 'secondary' as const, icon: FileText },
  SENT: { label: 'Sent', color: 'info' as const, icon: Clock },
  PAID: { label: 'Paid', color: 'success' as const, icon: CheckCircle },
  OVERDUE: { label: 'Overdue', color: 'danger' as const, icon: AlertCircle },
  CANCELLED: { label: 'Cancelled', color: 'secondary' as const, icon: XCircle }
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    try {
      const res = await fetch('/api/invoices')
      const data = await res.json()
      setInvoices(data)
    } catch (error) {
      console.error('Failed to fetch invoices:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch =
      invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.client.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalRevenue = invoices
    .filter(i => i.status === 'PAID')
    .reduce((sum, i) => sum + i.total, 0)

  const pendingAmount = invoices
    .filter(i => i.status === 'SENT' || i.status === 'OVERDUE')
    .reduce((sum, i) => sum + i.total, 0)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Invoices</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">Manage your billing and payments</p>
        </div>
        <Link href="/admin/invoices/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Invoice
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Total Revenue</p>
              <p className="text-xl font-bold">{formatCurrency(totalRevenue)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Pending</p>
              <p className="text-xl font-bold">{formatCurrency(pendingAmount)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Overdue</p>
              <p className="text-xl font-bold">{invoices.filter(i => i.status === 'OVERDUE').length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 dark:text-neutral-500" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search invoices..."
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="all">All Status</option>
          <option value="DRAFT">Draft</option>
          <option value="SENT">Sent</option>
          <option value="PAID">Paid</option>
          <option value="OVERDUE">Overdue</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Invoices Table */}
      {filteredInvoices.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="w-12 h-12 text-neutral-400 dark:text-neutral-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">No invoices yet</h3>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">Create your first invoice to start billing clients</p>
          <Link href="/admin/invoices/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Invoice
            </Button>
          </Link>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-neutral-50 dark:bg-neutral-800">
                  <th className="text-left p-4 font-medium text-neutral-600 dark:text-neutral-400">Invoice</th>
                  <th className="text-left p-4 font-medium text-neutral-600 dark:text-neutral-400">Client</th>
                  <th className="text-left p-4 font-medium text-neutral-600 dark:text-neutral-400">Package</th>
                  <th className="text-left p-4 font-medium text-neutral-600 dark:text-neutral-400">Amount</th>
                  <th className="text-left p-4 font-medium text-neutral-600 dark:text-neutral-400">Due Date</th>
                  <th className="text-left p-4 font-medium text-neutral-600 dark:text-neutral-400">Status</th>
                  <th className="text-right p-4 font-medium text-neutral-600 dark:text-neutral-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map(invoice => {
                  const StatusIcon = statusConfig[invoice.status].icon
                  return (
                    <tr key={invoice.id} className="border-b hover:bg-neutral-50 dark:bg-neutral-800">
                      <td className="p-4">
                        <Link href={`/admin/invoices/${invoice.id}`} className="font-medium text-amber-600 hover:text-amber-700">
                          {invoice.invoiceNumber}
                        </Link>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-neutral-900 dark:text-neutral-100">{invoice.client.name}</p>
                          <p className="text-sm text-neutral-500 dark:text-neutral-400">{invoice.client.email}</p>
                        </div>
                      </td>
                      <td className="p-4 text-neutral-600 dark:text-neutral-400">
                        {invoice.package?.title || '-'}
                      </td>
                      <td className="p-4 font-medium">
                        {formatCurrency(invoice.total)}
                      </td>
                      <td className="p-4 text-neutral-600 dark:text-neutral-400">
                        {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '-'}
                      </td>
                      <td className="p-4">
                        <Badge variant={statusConfig[invoice.status].color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConfig[invoice.status].label}
                        </Badge>
                      </td>
                      <td className="p-4 text-right">
                        <Link href={`/admin/invoices/${invoice.id}`}>
                          <Button size="sm" variant="ghost">
                            View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
