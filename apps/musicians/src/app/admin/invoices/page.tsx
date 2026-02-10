'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Plus,
  Search,
  FileText,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'
import { Button, Card, Input, Badge } from '@vertigo/ui'

interface Invoice {
  id: string
  invoiceNumber: string
  status: string
  totalAmount: number
  issueDate: string
  dueDate: string
  paidDate?: string
  customer: {
    firstName: string
    lastName: string
    company?: string
  }
  gig?: {
    title: string
  }
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'warning' | 'success' | 'danger'; icon: typeof FileText }> = {
  draft: { label: 'Koncept', variant: 'default', icon: FileText },
  sent: { label: 'Odesláno', variant: 'warning', icon: Clock },
  paid: { label: 'Zaplaceno', variant: 'success', icon: CheckCircle },
  overdue: { label: 'Po splatnosti', variant: 'danger', icon: AlertCircle },
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    try {
      const response = await fetch('/api/invoices')
      if (response.ok) {
        const data = await response.json()
        setInvoices(data.invoices || [])
      }
    } catch (error) {
      toast.error('Nepodařilo se načíst faktury')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredInvoices = invoices.filter((invoice) => {
    const clientName = `${invoice.customer.firstName} ${invoice.customer.lastName}`.toLowerCase()
    const matchesSearch =
      invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clientName.includes(searchQuery.toLowerCase()) ||
      invoice.gig?.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: invoices.length,
    paid: invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.totalAmount, 0),
    pending: invoices.filter(inv => inv.status === 'sent' || inv.status === 'overdue').reduce((sum, inv) => sum + inv.totalAmount, 0),
    overdue: invoices.filter(inv => inv.status === 'overdue').length,
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Faktury</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Správa faktur a sledování plateb
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/invoices/new">
            <Plus className="w-4 h-4 mr-2" />
            Nová faktura
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <Input
              placeholder="Hledat faktury..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">Všechny stavy</option>
            <option value="draft">Koncept</option>
            <option value="sent">Odesláno</option>
            <option value="paid">Zaplaceno</option>
            <option value="overdue">Po splatnosti</option>
          </select>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-neutral-600 dark:text-neutral-400">Celkem faktur</div>
          <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-1">{stats.total}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-neutral-600 dark:text-neutral-400">Zaplaceno</div>
          <div className="text-2xl font-bold text-green-600 mt-1">
            {formatCurrency(stats.paid / 100)}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-neutral-600 dark:text-neutral-400">Čeká</div>
          <div className="text-2xl font-bold text-yellow-600 mt-1">
            {formatCurrency(stats.pending / 100)}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-neutral-600 dark:text-neutral-400">Po splatnosti</div>
          <div className="text-2xl font-bold text-red-600 mt-1">{stats.overdue}</div>
        </Card>
      </div>

      {/* Invoices list */}
      <div className="space-y-3">
        {filteredInvoices.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              Žádné faktury nenalezeny
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              {searchQuery || statusFilter !== 'all'
                ? 'Zkuste upravit filtry'
                : 'Vytvořte první fakturu'}
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <Button asChild>
                <Link href="/admin/invoices/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Vytvořit první fakturu
                </Link>
              </Button>
            )}
          </Card>
        ) : (
          filteredInvoices.map((invoice) => {
            const status = statusConfig[invoice.status] || statusConfig.draft
            const StatusIcon = status.icon

            return (
              <Link key={invoice.id} href={`/admin/invoices/${invoice.id}`}>
                <Card className="p-6 hover:border-primary-300 hover:shadow-md transition cursor-pointer">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                          {invoice.invoiceNumber}
                        </h3>
                        <Badge variant={status.variant}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {status.label}
                        </Badge>
                      </div>

                      <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                        {invoice.gig?.title || `${invoice.customer.firstName} ${invoice.customer.lastName}`}
                      </div>

                      <div className="grid sm:grid-cols-3 gap-3 text-sm text-neutral-600 dark:text-neutral-400">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>Splatnost: {formatDate(new Date(invoice.dueDate))}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          <span>{invoice.customer.firstName} {invoice.customer.lastName}</span>
                        </div>
                        {invoice.paidDate && (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            <span>Zaplaceno: {formatDate(new Date(invoice.paidDate))}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                        {formatCurrency(invoice.totalAmount / 100)}
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            )
          })
        )}
      </div>
    </div>
  )
}
