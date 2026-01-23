'use client'

/**
 * Invoice List Page (FAKTURY)
 *
 * Displays all invoices with filters, search, and bulk actions
 */

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Plus,
  Search,
  Filter,
  Download,
  Trash2,
  Mail,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  MoreHorizontal,
  ChevronDown,
  RefreshCw,
  Eye,
  Copy,
  Edit,
  XCircle,
} from 'lucide-react'
import {
  DOCUMENT_TYPE_LABELS,
  INVOICE_STATUS_LABELS,
  formatAmount,
  type Invoice,
} from '@/types/invoicing'

type InvoiceStatus = 'ALL' | 'DRAFT' | 'SENT' | 'PAID' | 'PARTIALLY_PAID' | 'OVERDUE' | 'CANCELLED'
type DocumentType = 'ALL' | 'FAKTURA' | 'PROFORMA' | 'ZALOHOVA' | 'VYZVA_K_PLATBE' | 'OPRAVNY_DOKLAD' | 'PRIJMOVY_DOKLAD' | 'DANOVY_DOKLAD' | 'CENOVA_NABIDKA'

interface InvoiceListItem {
  id: string
  invoiceNumber: string
  documentType: string
  status: string
  totalAmount: number
  currency: string
  issueDate: string
  dueDate: string
  customer: {
    id: string
    name: string
    email: string | null
  } | null
  paidAmount: number
  paidAt: string | null
}

interface PaginationInfo {
  total: number
  page: number
  limit: number
  totalPages: number
}

const STATUS_TABS: { id: InvoiceStatus; label: string; icon: React.ElementType; color: string }[] = [
  { id: 'ALL', label: 'Všechny', icon: FileText, color: 'text-gray-600' },
  { id: 'DRAFT', label: 'Koncepty', icon: Edit, color: 'text-gray-500' },
  { id: 'SENT', label: 'Odeslané', icon: Mail, color: 'text-blue-600' },
  { id: 'PAID', label: 'Uhrazené', icon: CheckCircle2, color: 'text-green-600' },
  { id: 'PARTIALLY_PAID', label: 'Částečně', icon: Clock, color: 'text-yellow-600' },
  { id: 'OVERDUE', label: 'Po splatnosti', icon: AlertCircle, color: 'text-red-600' },
  { id: 'CANCELLED', label: 'Zrušené', icon: XCircle, color: 'text-gray-400' },
]

export default function InvoicesPage() {
  const router = useRouter()
  const [invoices, setInvoices] = useState<InvoiceListItem[]>([])
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus>('ALL')
  const [documentTypeFilter, setDocumentTypeFilter] = useState<DocumentType>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showActions, setShowActions] = useState<string | null>(null)

  // Fetch invoices
  const fetchInvoices = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })

      if (statusFilter !== 'ALL') params.set('status', statusFilter)
      if (documentTypeFilter !== 'ALL') params.set('documentType', documentTypeFilter)
      if (searchQuery) params.set('search', searchQuery)
      if (dateFrom) params.set('dateFrom', dateFrom)
      if (dateTo) params.set('dateTo', dateTo)

      const res = await fetch(`/api/admin/invoicing/invoices?${params}`)
      if (!res.ok) throw new Error('Chyba při načítání faktur')

      const data = await res.json()
      setInvoices(data.invoices)
      setPagination(data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Neznámá chyba')
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.limit, statusFilter, documentTypeFilter, searchQuery, dateFrom, dateTo])

  useEffect(() => {
    fetchInvoices()
  }, [fetchInvoices])

  // Handle actions
  const handleAction = async (invoiceId: string, action: string) => {
    setShowActions(null)

    try {
      switch (action) {
        case 'view':
          router.push(`/admin/invoicing/invoices/${invoiceId}`)
          break
        case 'edit':
          router.push(`/admin/invoicing/invoices/${invoiceId}/edit`)
          break
        case 'duplicate':
          const dupRes = await fetch(`/api/admin/invoicing/invoices/${invoiceId}?action=duplicate`, {
            method: 'POST',
          })
          if (!dupRes.ok) throw new Error('Chyba při duplikování')
          const dupData = await dupRes.json()
          router.push(`/admin/invoicing/invoices/${dupData.id}`)
          break
        case 'pdf':
          window.open(`/api/admin/invoicing/invoices/${invoiceId}/pdf`, '_blank')
          break
        case 'send':
          const sendRes = await fetch(`/api/admin/invoicing/invoices/${invoiceId}?action=send`, {
            method: 'POST',
          })
          if (!sendRes.ok) throw new Error('Chyba při odesílání')
          fetchInvoices()
          break
        case 'markPaid':
          const paidRes = await fetch(`/api/admin/invoicing/invoices/${invoiceId}?action=markPaid`, {
            method: 'POST',
          })
          if (!paidRes.ok) throw new Error('Chyba při označování')
          fetchInvoices()
          break
        case 'cancel':
          if (!confirm('Opravdu chcete zrušit tuto fakturu?')) return
          const cancelRes = await fetch(`/api/admin/invoicing/invoices/${invoiceId}?action=cancel`, {
            method: 'POST',
          })
          if (!cancelRes.ok) throw new Error('Chyba při rušení')
          fetchInvoices()
          break
        case 'delete':
          if (!confirm('Opravdu chcete smazat tuto fakturu?')) return
          const delRes = await fetch(`/api/admin/invoicing/invoices/${invoiceId}`, {
            method: 'DELETE',
          })
          if (!delRes.ok) throw new Error('Chyba při mazání')
          fetchInvoices()
          break
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Chyba při provádění akce')
    }
  }

  // Bulk actions
  const handleBulkAction = async (action: string) => {
    if (selectedIds.size === 0) return

    try {
      const ids = Array.from(selectedIds)

      switch (action) {
        case 'delete':
          if (!confirm(`Opravdu chcete smazat ${ids.length} faktur?`)) return
          await fetch('/api/admin/invoicing/invoices/bulk', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids }),
          })
          break
        case 'markPaid':
          await fetch('/api/admin/invoicing/invoices/bulk', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids, action: 'markPaid' }),
          })
          break
        case 'send':
          await fetch('/api/admin/invoicing/invoices/bulk', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids, action: 'send' }),
          })
          break
      }

      setSelectedIds(new Set())
      fetchInvoices()
    } catch (err) {
      alert('Chyba při hromadné akci')
    }
  }

  // Export
  const handleExport = async (format: 'csv' | 'xlsx') => {
    const params = new URLSearchParams()
    if (statusFilter !== 'ALL') params.set('status', statusFilter)
    if (documentTypeFilter !== 'ALL') params.set('documentType', documentTypeFilter)
    if (searchQuery) params.set('search', searchQuery)
    if (dateFrom) params.set('dateFrom', dateFrom)
    if (dateTo) params.set('dateTo', dateTo)
    params.set('format', format)

    window.open(`/api/admin/invoicing/invoices/export?${params}`, '_blank')
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
    if (selectedIds.size === invoices.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(invoices.map(i => i.id)))
    }
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    const config: Record<string, { bg: string; text: string; label: string }> = {
      DRAFT: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-300', label: 'Koncept' },
      SENT: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', label: 'Odesláno' },
      PAID: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', label: 'Uhrazeno' },
      PARTIALLY_PAID: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', label: 'Částečně' },
      OVERDUE: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', label: 'Po splatnosti' },
      CANCELLED: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-500 dark:text-gray-400', label: 'Zrušeno' },
    }
    const c = config[status] || config.DRAFT
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${c.bg} ${c.text}`}>
        {c.label}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Faktury</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Správa faktur a daňových dokladů
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchInvoices}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Obnovit
          </button>

          <div className="relative">
            <button
              onClick={() => setShowActions(showActions === 'export' ? null : 'export')}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
              <ChevronDown className="w-4 h-4" />
            </button>

            {showActions === 'export' && (
              <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                <button
                  onClick={() => { handleExport('csv'); setShowActions(null) }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Export CSV
                </button>
                <button
                  onClick={() => { handleExport('xlsx'); setShowActions(null) }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Export Excel
                </button>
              </div>
            )}
          </div>

          <Link
            href="/admin/invoicing/invoices/new"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nová faktura
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

      {/* Status Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {STATUS_TABS.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => { setStatusFilter(tab.id); setPagination(p => ({ ...p, page: 1 })) }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                statusFilter === tab.id
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
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
                placeholder="Hledat podle čísla, zákazníka..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Document Type */}
          <select
            value={documentTypeFilter}
            onChange={(e) => { setDocumentTypeFilter(e.target.value as DocumentType); setPagination(p => ({ ...p, page: 1 })) }}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="ALL">Všechny typy</option>
            {Object.entries(DOCUMENT_TYPE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          {/* Date Range */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="text-gray-500">-</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Clear Filters */}
          {(searchQuery || documentTypeFilter !== 'ALL' || dateFrom || dateTo) && (
            <button
              onClick={() => {
                setSearchQuery('')
                setDocumentTypeFilter('ALL')
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

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-blue-700 dark:text-blue-400">
              Vybráno: {selectedIds.size} faktur
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkAction('send')}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Mail className="w-4 h-4" />
                Odeslat
              </button>
              <button
                onClick={() => handleBulkAction('markPaid')}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <CheckCircle2 className="w-4 h-4" />
                Uhrazeno
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4" />
                Smazat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === invoices.length && invoices.length > 0}
                    onChange={toggleAllSelection}
                    className="rounded border-gray-300 dark:border-gray-600"
                  />
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">
                  Číslo
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">
                  Typ
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">
                  Zákazník
                </th>
                <th className="text-right px-4 py-3 font-medium text-gray-500 dark:text-gray-400">
                  Částka
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">
                  Vystaveno
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">
                  Splatnost
                </th>
                <th className="text-center px-4 py-3 font-medium text-gray-500 dark:text-gray-400">
                  Stav
                </th>
                <th className="w-12 px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Načítám faktury...
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    Žádné faktury nenalezeny
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                    onClick={() => router.push(`/admin/invoicing/invoices/${invoice.id}`)}
                  >
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(invoice.id)}
                        onChange={() => toggleSelection(invoice.id)}
                        className="rounded border-gray-300 dark:border-gray-600"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {invoice.invoiceNumber}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {DOCUMENT_TYPE_LABELS[invoice.documentType as keyof typeof DOCUMENT_TYPE_LABELS] || invoice.documentType}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {invoice.customer?.name || 'Bez zákazníka'}
                        </p>
                        {invoice.customer?.email && (
                          <p className="text-sm text-gray-500">{invoice.customer.email}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatAmount(invoice.totalAmount, invoice.currency)}
                      </span>
                      {invoice.paidAmount > 0 && invoice.paidAmount < invoice.totalAmount && (
                        <p className="text-sm text-green-600">
                          Uhrazeno: {formatAmount(invoice.paidAmount, invoice.currency)}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      {new Date(invoice.issueDate).toLocaleDateString('cs-CZ')}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`${
                        invoice.status === 'OVERDUE'
                          ? 'text-red-600 dark:text-red-400 font-medium'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {new Date(invoice.dueDate).toLocaleDateString('cs-CZ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {getStatusBadge(invoice.status)}
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="relative">
                        <button
                          onClick={() => setShowActions(showActions === invoice.id ? null : invoice.id)}
                          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600"
                        >
                          <MoreHorizontal className="w-5 h-5 text-gray-500" />
                        </button>

                        {showActions === invoice.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                            <button
                              onClick={() => handleAction(invoice.id, 'view')}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <Eye className="w-4 h-4" />
                              Zobrazit
                            </button>
                            <button
                              onClick={() => handleAction(invoice.id, 'edit')}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <Edit className="w-4 h-4" />
                              Upravit
                            </button>
                            <button
                              onClick={() => handleAction(invoice.id, 'duplicate')}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <Copy className="w-4 h-4" />
                              Duplikovat
                            </button>
                            <button
                              onClick={() => handleAction(invoice.id, 'pdf')}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <FileText className="w-4 h-4" />
                              Stáhnout PDF
                            </button>
                            <hr className="my-1 border-gray-200 dark:border-gray-700" />
                            {invoice.status === 'DRAFT' && (
                              <button
                                onClick={() => handleAction(invoice.id, 'send')}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                              >
                                <Mail className="w-4 h-4" />
                                Odeslat
                              </button>
                            )}
                            {['SENT', 'OVERDUE', 'PARTIALLY_PAID'].includes(invoice.status) && (
                              <button
                                onClick={() => handleAction(invoice.id, 'markPaid')}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                Označit jako uhrazeno
                              </button>
                            )}
                            {invoice.status !== 'CANCELLED' && invoice.status !== 'PAID' && (
                              <button
                                onClick={() => handleAction(invoice.id, 'cancel')}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-orange-700 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                              >
                                <XCircle className="w-4 h-4" />
                                Zrušit
                              </button>
                            )}
                            <hr className="my-1 border-gray-200 dark:border-gray-700" />
                            <button
                              onClick={() => handleAction(invoice.id, 'delete')}
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
                onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                disabled={pagination.page <= 1}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Předchozí
              </button>

              <span className="text-sm text-gray-600 dark:text-gray-400">
                Strana {pagination.page} z {pagination.totalPages}
              </span>

              <button
                onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
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
