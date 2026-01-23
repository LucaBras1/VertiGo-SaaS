'use client'

import { useState, useEffect } from 'react'
import {
  FileText,
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Download,
  Send,
  CheckCircle,
  Clock,
  AlertCircle,
  Trash2,
} from 'lucide-react'
import { Menu, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { format, parseISO, isPast } from 'date-fns'
import { cs } from 'date-fns/locale'
import toast from 'react-hot-toast'
import { cn, formatCurrency } from '@/lib/utils'
import { InvoiceFormModal } from '@/components/invoices/InvoiceFormModal'

interface Invoice {
  id: string
  invoiceNumber: string
  status: string
  issueDate: string
  dueDate: string
  paidDate: string | null
  subtotal: number
  tax: number
  total: number
  client: {
    id: string
    name: string
    email: string
  }
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  draft: { label: 'Koncept', color: 'bg-gray-100 text-gray-800', icon: FileText },
  sent: { label: 'Odesláno', color: 'bg-blue-100 text-blue-800', icon: Send },
  paid: { label: 'Zaplaceno', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  overdue: { label: 'Po splatnosti', color: 'bg-red-100 text-red-800', icon: AlertCircle },
  cancelled: { label: 'Zrušeno', color: 'bg-gray-100 text-gray-800', icon: FileText },
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/invoices')
      const data = await response.json()
      if (response.ok) {
        // Check for overdue invoices
        const processedInvoices = (data.invoices || []).map((invoice: Invoice) => {
          if (invoice.status === 'sent' && isPast(parseISO(invoice.dueDate))) {
            return { ...invoice, status: 'overdue' }
          }
          return invoice
        })
        setInvoices(processedInvoices)
      }
    } catch {
      toast.error('Chyba při načítání faktur')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendInvoice = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'sent' }),
      })

      if (!response.ok) {
        throw new Error('Chyba při odesílání')
      }

      toast.success('Faktura byla odeslána')
      fetchInvoices()
    } catch {
      toast.error('Chyba při odesílání faktury')
    }
  }

  const handleMarkAsPaid = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'paid',
          paidDate: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error('Chyba při aktualizaci')
      }

      toast.success('Faktura byla označena jako zaplacená')
      fetchInvoices()
    } catch {
      toast.error('Chyba při změně stavu faktury')
    }
  }

  const handleDelete = async (invoiceId: string) => {
    if (!confirm('Opravdu chcete smazat tuto fakturu?')) return

    try {
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Chyba při mazání')
      }

      toast.success('Faktura byla smazána')
      fetchInvoices()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Chyba při mazání')
    }
  }

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      search === '' ||
      invoice.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      invoice.client.name.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === '' || invoice.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Calculate totals
  const totalUnpaid = invoices
    .filter((i) => i.status === 'sent' || i.status === 'overdue')
    .reduce((sum, i) => sum + i.total, 0)
  const totalOverdue = invoices
    .filter((i) => i.status === 'overdue')
    .reduce((sum, i) => sum + i.total, 0)

  return (
    <>
      {/* Page header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Faktury</h1>
                <p className="text-gray-600">Správa faktur a plateb</p>
              </div>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Nová faktura
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 sm:px-6 lg:px-8 py-4 bg-gray-50 border-b border-gray-200">
        <div className="flex gap-6">
          <div>
            <p className="text-sm text-gray-500">Nezaplaceno</p>
            <p className="text-lg font-semibold text-gray-900">{formatCurrency(totalUnpaid)}</p>
          </div>
          {totalOverdue > 0 && (
            <div>
              <p className="text-sm text-gray-500">Po splatnosti</p>
              <p className="text-lg font-semibold text-red-600">{formatCurrency(totalOverdue)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 sm:px-6 lg:px-8 py-4 bg-white border-b border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="search"
              placeholder="Hledat podle čísla faktury nebo klienta..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Všechny stavy</option>
            <option value="draft">Koncept</option>
            <option value="sent">Odesláno</option>
            <option value="paid">Zaplaceno</option>
            <option value="overdue">Po splatnosti</option>
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Žádné faktury</h3>
            <p className="text-gray-500 mb-4">
              {search || statusFilter
                ? 'Nenalezeny žádné faktury odpovídající filtrům'
                : 'Začněte vytvořením první faktury'}
            </p>
            {!search && !statusFilter && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                <Plus className="h-5 w-5" />
                Vytvořit fakturu
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Faktura
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Klient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Datum vystavení
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Splatnost
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Částka
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Akce</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredInvoices.map((invoice) => {
                    const StatusIcon = statusConfig[invoice.status]?.icon || FileText

                    return (
                      <tr key={invoice.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">
                            {invoice.invoiceNumber}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {invoice.client.name}
                            </p>
                            <p className="text-sm text-gray-500">{invoice.client.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {format(parseISO(invoice.issueDate), 'd. MMMM yyyy', { locale: cs })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {format(parseISO(invoice.dueDate), 'd. MMMM yyyy', { locale: cs })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold text-gray-900">
                            {formatCurrency(invoice.total)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={cn(
                              'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium',
                              statusConfig[invoice.status]?.color || 'bg-gray-100 text-gray-800'
                            )}
                          >
                            <StatusIcon className="h-3 w-3" />
                            {statusConfig[invoice.status]?.label || invoice.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Menu as="div" className="relative inline-block text-left">
                            <Menu.Button className="p-1 rounded-lg hover:bg-gray-100">
                              <MoreHorizontal className="h-5 w-5 text-gray-400" />
                            </Menu.Button>
                            <Transition
                              as={Fragment}
                              enter="transition ease-out duration-100"
                              enterFrom="transform opacity-0 scale-95"
                              enterTo="transform opacity-100 scale-100"
                              leave="transition ease-in duration-75"
                              leaveFrom="transform opacity-100 scale-100"
                              leaveTo="transform opacity-0 scale-95"
                            >
                              <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                                <div className="py-1">
                                  <Menu.Item>
                                    {({ active }) => (
                                      <button
                                        className={cn(
                                          'flex items-center gap-2 px-4 py-2 text-sm w-full',
                                          active ? 'bg-gray-50' : ''
                                        )}
                                      >
                                        <Eye className="h-4 w-4" />
                                        Zobrazit
                                      </button>
                                    )}
                                  </Menu.Item>
                                  <Menu.Item>
                                    {({ active }) => (
                                      <button
                                        className={cn(
                                          'flex items-center gap-2 px-4 py-2 text-sm w-full',
                                          active ? 'bg-gray-50' : ''
                                        )}
                                      >
                                        <Download className="h-4 w-4" />
                                        Stáhnout PDF
                                      </button>
                                    )}
                                  </Menu.Item>
                                  {invoice.status === 'draft' && (
                                    <>
                                      <Menu.Item>
                                        {({ active }) => (
                                          <button
                                            onClick={() => handleSendInvoice(invoice.id)}
                                            className={cn(
                                              'flex items-center gap-2 px-4 py-2 text-sm w-full',
                                              active ? 'bg-gray-50' : ''
                                            )}
                                          >
                                            <Send className="h-4 w-4" />
                                            Odeslat
                                          </button>
                                        )}
                                      </Menu.Item>
                                      <Menu.Item>
                                        {({ active }) => (
                                          <button
                                            onClick={() => handleDelete(invoice.id)}
                                            className={cn(
                                              'flex items-center gap-2 px-4 py-2 text-sm w-full text-red-600',
                                              active ? 'bg-red-50' : ''
                                            )}
                                          >
                                            <Trash2 className="h-4 w-4" />
                                            Smazat
                                          </button>
                                        )}
                                      </Menu.Item>
                                    </>
                                  )}
                                  {(invoice.status === 'sent' || invoice.status === 'overdue') && (
                                    <Menu.Item>
                                      {({ active }) => (
                                        <button
                                          onClick={() => handleMarkAsPaid(invoice.id)}
                                          className={cn(
                                            'flex items-center gap-2 px-4 py-2 text-sm w-full text-green-600',
                                            active ? 'bg-green-50' : ''
                                          )}
                                        >
                                          <CheckCircle className="h-4 w-4" />
                                          Označit jako zaplaceno
                                        </button>
                                      )}
                                    </Menu.Item>
                                  )}
                                </div>
                              </Menu.Items>
                            </Transition>
                          </Menu>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <InvoiceFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchInvoices}
      />
    </>
  )
}
