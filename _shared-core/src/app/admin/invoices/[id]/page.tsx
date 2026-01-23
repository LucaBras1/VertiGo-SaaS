/**
 * Invoice Detail Page
 * Displays full invoice information with Vyfakturuj integration
 */
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  FileText,
  User,
  Calendar,
  DollarSign,
  Send,
  CheckCircle,
  ExternalLink,
  Download,
  RefreshCw,
  QrCode,
} from 'lucide-react'
import type { InvoicePopulated } from '@/types/admin'
import { useToast } from '@/hooks/useToast'

const statusLabels: Record<string, string> = {
  draft: 'Koncept',
  sent: 'Odeslána',
  paid: 'Zaplacena',
  overdue: 'Po splatnosti',
  cancelled: 'Stornována',
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  sent: 'bg-blue-100 text-blue-800',
  paid: 'bg-green-100 text-green-800',
  overdue: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
}

export default function InvoiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const invoiceId = params.id as string

  const [invoice, setInvoice] = useState<InvoicePopulated | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [markingPaid, setMarkingPaid] = useState(false)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [qrLoading, setQrLoading] = useState(false)

  useEffect(() => {
    fetchInvoice()
  }, [invoiceId])

  const fetchInvoice = async () => {
    try {
      const response = await fetch(`/api/admin/invoices/${invoiceId}?populate=true`)
      if (!response.ok) {
        throw new Error('Failed to fetch invoice')
      }
      const data = await response.json()
      setInvoice(data.invoice)
    } catch (error) {
      console.error('Error fetching invoice:', error)
      toast('Chyba při načítání faktury', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSync = async () => {
    if (!invoice?.vyfakturujId) return

    setSyncing(true)
    try {
      const response = await fetch(`/api/admin/invoices/${invoiceId}/vyfakturuj`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync' }),
      })

      const data = await response.json()
      if (data.success) {
        toast('Faktura synchronizována', 'success')
        await fetchInvoice()
      } else {
        toast(data.error || 'Chyba při synchronizaci', 'error')
      }
    } catch (error) {
      toast('Chyba při synchronizaci', 'error')
    } finally {
      setSyncing(false)
    }
  }

  const handleSendEmail = async () => {
    if (!invoice?.vyfakturujId || !invoice?.customer?.email) return

    setSendingEmail(true)
    try {
      const response = await fetch(`/api/admin/invoices/${invoiceId}/vyfakturuj`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send-email',
          recipients: [invoice.customer.email],
        }),
      })

      const data = await response.json()
      if (data.success) {
        toast('Faktura odeslána emailem', 'success')
        await fetchInvoice()
      } else {
        toast(data.error || 'Chyba při odesílání', 'error')
      }
    } catch (error) {
      toast('Chyba při odesílání emailu', 'error')
    } finally {
      setSendingEmail(false)
    }
  }

  const handleMarkPaid = async () => {
    if (!invoice?.vyfakturujId) return

    setMarkingPaid(true)
    try {
      const response = await fetch(`/api/admin/invoices/${invoiceId}/vyfakturuj`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'mark-paid',
          paidDate: new Date().toISOString(),
        }),
      })

      const data = await response.json()
      if (data.success) {
        toast('Faktura označena jako uhrazená', 'success')
        await fetchInvoice()
      } else {
        toast(data.error || 'Chyba při označování', 'error')
      }
    } catch (error) {
      toast('Chyba při označování jako uhrazeno', 'error')
    } finally {
      setMarkingPaid(false)
    }
  }

  const handleGetPdf = async () => {
    if (!invoice?.vyfakturujId) return

    try {
      const response = await fetch(
        `/api/admin/invoices/${invoiceId}/vyfakturuj?action=pdf`
      )

      const data = await response.json()
      if (data.pdfUrl) {
        window.open(data.pdfUrl, '_blank')
      } else {
        toast('PDF není dostupné', 'error')
      }
    } catch (error) {
      toast('Chyba při získávání PDF', 'error')
    }
  }

  const fetchQrCode = async () => {
    setQrLoading(true)
    try {
      const response = await fetch(`/api/admin/invoices/${invoiceId}/qr`)
      const data = await response.json()
      if (data.success && data.qrCode) {
        setQrCode(data.qrCode)
      }
    } catch (error) {
      console.error('Error fetching QR code:', error)
    } finally {
      setQrLoading(false)
    }
  }

  // Fetch QR code when invoice is loaded and has status != paid/cancelled
  useEffect(() => {
    if (invoice && invoice.status !== 'paid' && invoice.status !== 'cancelled') {
      fetchQrCode()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoiceId, invoice?.status])

  if (loading) {
    return (
      <div className="px-4 py-8 sm:px-0">
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-2 text-sm text-gray-500">Načítání faktury...</p>
        </div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="px-4 py-8 sm:px-0">
        <div className="text-center py-12">
          <p className="text-gray-500">Faktura nenalezena</p>
          <Link
            href="/admin/invoices"
            className="mt-4 inline-block text-blue-600 hover:text-blue-900"
          >
            Zpět na seznam
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-8 sm:px-0">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin/invoices"
          className="text-sm text-blue-600 hover:text-blue-900 mb-2 inline-block"
        >
          Zpět na faktury
        </Link>
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Faktura {invoice.invoiceNumber}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Vystaveno: {new Date(invoice.issueDate).toLocaleDateString('cs-CZ')}
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex flex-wrap gap-2">
            {/* Vyfakturuj Actions */}
            {invoice.vyfakturujId && (
              <>
                <button
                  onClick={handleSync}
                  disabled={syncing}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
                  Sync
                </button>
                <button
                  onClick={handleGetPdf}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <Download className="h-4 w-4" />
                  PDF
                </button>
                {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                  <>
                    <button
                      onClick={handleSendEmail}
                      disabled={sendingEmail}
                      className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-700 border border-blue-200 rounded-md hover:bg-blue-100 disabled:opacity-50"
                    >
                      <Send className={`h-4 w-4 ${sendingEmail ? 'animate-pulse' : ''}`} />
                      Odeslat email
                    </button>
                    <button
                      onClick={handleMarkPaid}
                      disabled={markingPaid}
                      className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-green-50 text-green-700 border border-green-200 rounded-md hover:bg-green-100 disabled:opacity-50"
                    >
                      <CheckCircle className={`h-4 w-4 ${markingPaid ? 'animate-pulse' : ''}`} />
                      Uhrazeno
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Status Badge */}
      <div className="mb-6 flex items-center gap-4">
        <span
          className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
            statusColors[invoice.status] || 'bg-gray-100 text-gray-800'
          }`}
        >
          {statusLabels[invoice.status] || invoice.status}
        </span>
        {invoice.vyfakturujId && (
          <span className="inline-flex items-center gap-1 text-sm text-gray-500">
            <FileText className="h-4 w-4" />
            Vyfakturuj: {invoice.vyfakturujNumber || `#${invoice.vyfakturujId}`}
          </span>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="h-5 w-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900">Zákazník</h2>
            </div>
            <div className="space-y-2">
              <p className="text-gray-900 font-medium">
                {invoice.customer?.firstName} {invoice.customer?.lastName}
              </p>
              {invoice.customer?.organization && (
                <p className="text-gray-600">{invoice.customer.organization}</p>
              )}
              <p className="text-gray-600">{invoice.customer?.email}</p>
              {invoice.customer?.phone && (
                <p className="text-gray-600">{invoice.customer.phone}</p>
              )}
            </div>
          </div>

          {/* Invoice Items */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900">Položky faktury</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase py-2">
                      Popis
                    </th>
                    <th className="text-right text-xs font-medium text-gray-500 uppercase py-2">
                      Množství
                    </th>
                    <th className="text-right text-xs font-medium text-gray-500 uppercase py-2">
                      Cena/ks
                    </th>
                    <th className="text-right text-xs font-medium text-gray-500 uppercase py-2">
                      Celkem
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {invoice.items?.map((item, index) => (
                    <tr key={index}>
                      <td className="py-2 text-sm text-gray-900">{item.description}</td>
                      <td className="py-2 text-sm text-gray-600 text-right">
                        {item.quantity}
                      </td>
                      <td className="py-2 text-sm text-gray-600 text-right">
                        {(item.unitPrice / 100).toLocaleString('cs-CZ')} Kč
                      </td>
                      <td className="py-2 text-sm text-gray-900 text-right font-medium">
                        {((item.totalPrice || item.quantity * item.unitPrice) / 100).toLocaleString('cs-CZ')} Kč
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Order Link */}
          {invoice.order && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Souvisí s objednávkou</h3>
              <Link
                href={`/admin/orders/${invoice.order.id || invoice.order}`}
                className="text-blue-600 hover:text-blue-900"
              >
                {invoice.order.orderNumber || 'Zobrazit objednávku'} →
              </Link>
            </div>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Pricing Summary */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="h-5 w-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900">Celkem</h2>
            </div>
            <div className="space-y-2">
              {invoice.subtotal && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Mezisoučet</span>
                  <span className="text-gray-900">
                    {(invoice.subtotal / 100).toLocaleString('cs-CZ')} Kč
                  </span>
                </div>
              )}
              {invoice.vatAmount && invoice.vatAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">DPH ({invoice.vatRate}%)</span>
                  <span className="text-gray-900">
                    {(invoice.vatAmount / 100).toLocaleString('cs-CZ')} Kč
                  </span>
                </div>
              )}
              <div className="pt-2 border-t border-gray-200">
                <div className="flex justify-between font-bold text-gray-900 text-lg">
                  <span>Celkem</span>
                  <span>{((invoice.totalAmount || 0) / 100).toLocaleString('cs-CZ')} Kč</span>
                </div>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900">Data</h2>
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-500">Vystaveno:</span>
                <p className="text-gray-900">
                  {new Date(invoice.issueDate).toLocaleDateString('cs-CZ')}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Splatnost:</span>
                <p className="text-gray-900">
                  {new Date(invoice.dueDate).toLocaleDateString('cs-CZ')}
                </p>
              </div>
              {invoice.paidDate && (
                <div>
                  <span className="text-gray-500">Uhrazeno:</span>
                  <p className="text-green-600 font-medium">
                    {new Date(invoice.paidDate).toLocaleDateString('cs-CZ')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-3">Platební údaje</h3>
            <div className="space-y-2 text-sm">
              {invoice.bankAccount && (
                <div>
                  <span className="text-gray-500">Účet:</span>
                  <p className="text-gray-900 font-mono">{invoice.bankAccount}</p>
                </div>
              )}
              {invoice.variableSymbol && (
                <div>
                  <span className="text-gray-500">VS:</span>
                  <p className="text-gray-900 font-mono">{invoice.variableSymbol}</p>
                </div>
              )}
              {invoice.vyfakturujVS && (
                <div>
                  <span className="text-gray-500">VS (Vyfakturuj):</span>
                  <p className="text-gray-900 font-mono">{invoice.vyfakturujVS}</p>
                </div>
              )}
              {invoice.iban && (
                <div>
                  <span className="text-gray-500">IBAN:</span>
                  <p className="text-gray-900 font-mono text-xs">{invoice.iban}</p>
                </div>
              )}
            </div>
          </div>

          {/* Vyfakturuj Links */}
          {invoice.vyfakturujId && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-3">Vyfakturuj.cz</h3>
              <div className="space-y-2">
                {invoice.publicUrl && (
                  <a
                    href={invoice.publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Zobrazit veřejný náhled
                  </a>
                )}
                {invoice.onlinePaymentUrl && (
                  <a
                    href={invoice.onlinePaymentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-green-600 hover:text-green-800"
                  >
                    <DollarSign className="h-4 w-4" />
                    Online platba
                  </a>
                )}
                {invoice.vyfakturujSyncedAt && (
                  <p className="text-xs text-gray-400 mt-2">
                    Synchronizováno:{' '}
                    {new Date(invoice.vyfakturujSyncedAt).toLocaleString('cs-CZ')}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* QR Code for Payment */}
          {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center gap-2 mb-3">
                <QrCode className="h-5 w-5 text-gray-400" />
                <h3 className="text-sm font-medium text-gray-500">QR platba</h3>
              </div>
              {qrLoading ? (
                <div className="flex justify-center py-4">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                </div>
              ) : qrCode ? (
                <div className="flex flex-col items-center">
                  <img
                    src={qrCode}
                    alt={`QR kód pro platbu faktury ${invoice.invoiceNumber}`}
                    className="w-40 h-40"
                  />
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Naskenujte v bankovní aplikaci
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">
                  QR kód není k dispozici
                </p>
              )}
            </div>
          )}

          {/* Notes */}
          {invoice.notes && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Poznámky</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{invoice.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
