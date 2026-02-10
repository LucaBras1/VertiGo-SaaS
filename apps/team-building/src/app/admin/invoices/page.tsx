/**
 * Invoices List Page
 * Admin page for managing invoices
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { FileText, Plus, Search, Eye, Trash2, Calendar, Building2, DollarSign, Download } from 'lucide-react'
import { ListPageHeader, SearchFilterBar, ActionButtons, StatusBadge } from '@vertigo/admin'
import { Button, Card, ConfirmDialog, staggerContainer, staggerItem } from '@vertigo/ui'
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
  customer: { id: string; firstName: string; lastName: string; organization: string | null }
  order: { id: string; orderNumber: string; sessionName: string | null } | null
}

const statusMap: Record<string, string> = {
  draft: 'draft',
  sent: 'sent',
  paid: 'paid',
  overdue: 'overdue',
  cancelled: 'cancelled',
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
      if (data.success) { setInvoices(data.data) }
      else { toast.error('Nepodařilo se načíst faktury') }
    } catch (error) { toast.error('Chyba při načítání faktur') }
    finally { setIsLoading(false) }
  }, [statusFilter])

  useEffect(() => { fetchInvoices() }, [fetchInvoices])

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      const response = await fetch(`/api/invoices/${deleteId}`, { method: 'DELETE' })
      const data = await response.json()
      if (data.success) { toast.success('Faktura byla smazána'); fetchInvoices() }
      else { toast.error(data.error || 'Nepodařilo se smazat fakturu') }
    } catch (error) { toast.error('Chyba při mazání faktury') }
    finally { setDeleteId(null) }
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency, minimumFractionDigits: 0 }).format(amount / 100)
  }

  const filteredInvoices = invoices.filter(invoice => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return invoice.invoiceNumber.toLowerCase().includes(searchLower) ||
      invoice.customer.firstName.toLowerCase().includes(searchLower) ||
      invoice.customer.lastName.toLowerCase().includes(searchLower) ||
      invoice.customer.organization?.toLowerCase().includes(searchLower)
  })

  const totals = invoices.reduce((acc, inv) => {
    acc.total += inv.totalAmount
    if (inv.status === 'paid') acc.paid += inv.totalAmount
    if (inv.status === 'overdue') acc.overdue += inv.totalAmount
    return acc
  }, { total: 0, paid: 0, overdue: 0 })

  if (isLoading) {
    return (<div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div></div>)
  }
  return (
    <div className="space-y-6">
      <ListPageHeader
        title="Faktury"
        description="Správa faktur a plateb"
        actionLabel="Nová faktura"
        actionHref="/admin/invoices/new"
        actionIcon={Plus}
      />

      {/* Summary Cards */}
      <motion.div className="grid grid-cols-1 gap-3 sm:grid-cols-3" variants={staggerContainer} initial="hidden" animate="visible">
        <motion.div variants={staggerItem}>
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Celkem fakturováno</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">{formatCurrency(totals.total, 'CZK')}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/30 rounded-lg flex items-center justify-center"><FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" /></div>
            </div>
          </Card>
        </motion.div>
        <motion.div variants={staggerItem}>
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Zaplaceno</p>
                <p className="text-2xl font-bold text-success-600 dark:text-success-400">{formatCurrency(totals.paid, 'CZK')}</p>
              </div>
              <div className="w-12 h-12 bg-success-50 dark:bg-success-950/30 rounded-lg flex items-center justify-center"><DollarSign className="w-6 h-6 text-success-600 dark:text-success-400" /></div>
            </div>
          </Card>
        </motion.div>
        <motion.div variants={staggerItem}>
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Po splatnosti</p>
                <p className="text-2xl font-bold text-error-600 dark:text-error-400">{formatCurrency(totals.overdue, 'CZK')}</p>
              </div>
              <div className="w-12 h-12 bg-error-50 dark:bg-error-950/30 rounded-lg flex items-center justify-center"><Calendar className="w-6 h-6 text-error-600 dark:text-error-400" /></div>
            </div>
          </Card>
        </motion.div>
      </motion.div>

      <SearchFilterBar
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Hledat faktury..."
        filters={[{
          label: 'Status', value: statusFilter,
          options: [
            { label: 'Všechny stavy', value: '' },
            { label: 'Koncepty', value: 'draft' },
            { label: 'Odeslané', value: 'sent' },
            { label: 'Zaplacené', value: 'paid' },
            { label: 'Po splatnosti', value: 'overdue' },
            { label: 'Zrušené', value: 'cancelled' },
          ], onChange: setStatusFilter,
        }]}
      />
      {/* Invoices Table */}
      {filteredInvoices.length === 0 ? (
        <Card className="text-center p-12">
          <FileText className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-2">Žádné faktury</h3>
          <p className="text-neutral-500 dark:text-neutral-400 mb-6">Zatím nemáte žádné faktury.</p>
          <Link href="/admin/invoices/new"><Button><Plus className="w-5 h-5" />Vytvořit fakturu</Button></Link>
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50/50 dark:border-neutral-800 dark:bg-neutral-800/50">
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Číslo faktury</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Zákazník</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Stav</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Splatnost</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Částka</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Akce</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                    <td className="py-4 px-6">
                      <div className="font-semibold text-neutral-900 dark:text-neutral-50">{invoice.invoiceNumber}</div>
                      {invoice.order && (<div className="text-xs text-neutral-400">{invoice.order.orderNumber}</div>)}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-neutral-400" />
                        <div className="text-sm text-neutral-900 dark:text-neutral-100">
                          {invoice.customer.organization || `${invoice.customer.firstName} ${invoice.customer.lastName}`}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6"><StatusBadge status={statusMap[invoice.status] || invoice.status} /></td>
                    <td className="py-4 px-6 text-sm text-neutral-600 dark:text-neutral-300">{new Date(invoice.dueDate).toLocaleDateString('cs-CZ')}</td>
                    <td className="py-4 px-6 text-right">
                      <div className="font-semibold text-neutral-900 dark:text-neutral-50">{formatCurrency(invoice.totalAmount, invoice.currency)}</div>
                      {invoice.status === 'paid' && (<div className="text-xs text-success-600 dark:text-success-400">Zaplaceno</div>)}
                      {invoice.paidAmount > 0 && invoice.paidAmount < invoice.totalAmount && (<div className="text-xs text-warning-600 dark:text-warning-400">Částečně: {formatCurrency(invoice.paidAmount, invoice.currency)}</div>)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <ActionButtons
                        viewHref={`/admin/invoices/${invoice.id}`}
                        onDelete={invoice.status === 'draft' ? () => setDeleteId(invoice.id) : undefined}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Smazat fakturu"
        description="Opravdu chcete smazat tento koncept faktury? Tato akce je nevratná."
        confirmLabel="Smazat"
        variant="danger"
      />
    </div>
  )
}
