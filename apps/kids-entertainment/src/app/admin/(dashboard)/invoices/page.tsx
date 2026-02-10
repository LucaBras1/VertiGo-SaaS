/**
 * Admin Invoices Page
 */

'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { FileText, Download, Mail, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [sendingId, setSendingId] = useState<string | null>(null)

  useEffect(() => {
    fetchInvoices()
  }, [])

  async function fetchInvoices() {
    try {
      const response = await fetch('/api/invoices')
      const data = await response.json()
      setInvoices(data)
    } catch (error) {
      console.error('Error fetching invoices:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      PAID: 'success',
      SENT: 'info',
      OVERDUE: 'danger',
      DRAFT: 'warning',
    }
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>
  }

  async function handleDownloadPDF(invoiceId: string, invoiceNumber: string) {
    setDownloadingId(invoiceId)
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/pdf`)
      if (!response.ok) {
        throw new Error('Chyba při generování PDF')
      }
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `faktura-${invoiceNumber}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('PDF staženo')
    } catch (error) {
      console.error('Error downloading PDF:', error)
      toast.error('Chyba při stahování PDF')
    } finally {
      setDownloadingId(null)
    }
  }

  async function handleSendEmail(invoiceId: string) {
    setSendingId(invoiceId)
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/send-email`, {
        method: 'POST',
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Chyba při odesílání emailu')
      }
      toast.success('Email odeslán')
    } catch (error) {
      console.error('Error sending email:', error)
      toast.error(error instanceof Error ? error.message : 'Chyba při odesílání emailu')
    } finally {
      setSendingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-partypal-pink-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Faktury</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">Správa faktur a plateb</p>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase">
                  Číslo faktury
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase">
                  Zákazník
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase">
                  Datum vystavení
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase">
                  Splatnost
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase">
                  Částka
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase">
                  Stav
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase">
                  Akce
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
                      <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                        {invoice.invoiceNumber}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-neutral-700 dark:text-neutral-300">
                    {invoice.customer.firstName} {invoice.customer.lastName}
                  </td>
                  <td className="px-6 py-4 text-neutral-600 dark:text-neutral-400 text-sm">
                    {new Date(invoice.issueDate).toLocaleDateString('cs-CZ')}
                  </td>
                  <td className="px-6 py-4 text-neutral-600 dark:text-neutral-400 text-sm">
                    {invoice.dueDate
                      ? new Date(invoice.dueDate).toLocaleDateString('cs-CZ')
                      : '-'}
                  </td>
                  <td className="px-6 py-4 font-semibold text-neutral-900 dark:text-neutral-100">
                    {invoice.total.toLocaleString('cs-CZ')} Kč
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(invoice.status)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleDownloadPDF(invoice.id, invoice.invoiceNumber)}
                        disabled={downloadingId === invoice.id}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Stáhnout PDF"
                      >
                        {downloadingId === invoice.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                        <span className="ml-1.5 hidden sm:inline">PDF</span>
                      </button>
                      <button
                        onClick={() => handleSendEmail(invoice.id)}
                        disabled={sendingId === invoice.id}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-partypal-pink-500 border border-transparent rounded-md hover:bg-partypal-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Odeslat email"
                      >
                        {sendingId === invoice.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Mail className="w-4 h-4" />
                        )}
                        <span className="ml-1.5 hidden sm:inline">Email</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {invoices.length === 0 && (
        <Card className="p-12">
          <div className="text-center text-neutral-500 dark:text-neutral-400">Žádné faktury</div>
        </Card>
      )}
    </div>
  )
}
