'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Plus,
  Search,
  FileText,
  DollarSign,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
} from 'lucide-react'

// Mock data
const mockInvoices = [
  {
    id: 'INV-001',
    gigTitle: 'Wedding - Smith & Johnson',
    clientName: 'Emma Smith',
    amount: 45000,
    status: 'paid',
    dueDate: '2026-02-15',
    paidDate: '2026-02-10',
    issueDate: '2026-01-20',
  },
  {
    id: 'INV-002',
    gigTitle: 'Corporate Event - Tech Corp',
    clientName: 'Tech Corp Ltd.',
    amount: 38000,
    status: 'pending',
    dueDate: '2026-02-20',
    paidDate: null,
    issueDate: '2026-01-22',
  },
  {
    id: 'INV-003',
    gigTitle: 'Private Birthday Party',
    clientName: 'John Doe',
    amount: 35000,
    status: 'overdue',
    dueDate: '2026-01-25',
    paidDate: null,
    issueDate: '2026-01-10',
  },
  {
    id: 'INV-004',
    gigTitle: 'Jazz Club Performance',
    clientName: 'Jazz Republic',
    amount: 32000,
    status: 'draft',
    dueDate: '2026-03-05',
    paidDate: null,
    issueDate: '2026-01-23',
  },
]

const statusConfig = {
  draft: {
    label: 'Draft',
    color: 'bg-gray-100 text-gray-700',
    icon: FileText,
  },
  pending: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-700',
    icon: Clock,
  },
  paid: {
    label: 'Paid',
    color: 'bg-green-100 text-green-700',
    icon: CheckCircle,
  },
  overdue: {
    label: 'Overdue',
    color: 'bg-red-100 text-red-700',
    icon: AlertCircle,
  },
}

export default function InvoicesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredInvoices = mockInvoices.filter((invoice) => {
    const matchesSearch =
      invoice.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.gigTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.clientName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalRevenue = mockInvoices
    .filter((inv) => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.amount, 0)

  const pendingAmount = mockInvoices
    .filter((inv) => inv.status === 'pending' || inv.status === 'overdue')
    .reduce((sum, inv) => sum + inv.amount, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-600 mt-1">
            Manage invoices and track payments
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/invoices/new">
            <Plus className="w-4 h-4 mr-2" />
            New Invoice
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search invoices..."
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
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-gray-600">Total Invoices</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {mockInvoices.length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Paid</div>
          <div className="text-2xl font-bold text-green-600 mt-1">
            {totalRevenue.toLocaleString('cs-CZ')} CZK
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Pending</div>
          <div className="text-2xl font-bold text-yellow-600 mt-1">
            {pendingAmount.toLocaleString('cs-CZ')} CZK
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Overdue</div>
          <div className="text-2xl font-bold text-red-600 mt-1">
            {mockInvoices.filter((inv) => inv.status === 'overdue').length}
          </div>
        </Card>
      </div>

      {/* Invoices list */}
      <div className="space-y-3">
        {filteredInvoices.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No invoices found
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Create your first invoice to get started'}
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <Button asChild>
                <Link href="/dashboard/invoices/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Invoice
                </Link>
              </Button>
            )}
          </Card>
        ) : (
          filteredInvoices.map((invoice) => {
            const statusInfo =
              statusConfig[invoice.status as keyof typeof statusConfig]
            const StatusIcon = statusInfo.icon

            return (
              <Link key={invoice.id} href={`/dashboard/invoices/${invoice.id}`}>
                <Card className="p-6 hover:border-primary-300 hover:shadow-md transition cursor-pointer">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {invoice.id}
                        </h3>
                        <span
                          className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded ${statusInfo.color}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {statusInfo.label}
                        </span>
                      </div>

                      <div className="text-sm text-gray-600 mb-3">
                        {invoice.gigTitle}
                      </div>

                      <div className="grid sm:grid-cols-3 gap-3 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>
                            Due: {new Date(invoice.dueDate).toLocaleDateString('cs-CZ')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          <span>{invoice.clientName}</span>
                        </div>
                        {invoice.paidDate && (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            <span>
                              Paid:{' '}
                              {new Date(invoice.paidDate).toLocaleDateString('cs-CZ')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        {invoice.amount.toLocaleString('cs-CZ')} CZK
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
