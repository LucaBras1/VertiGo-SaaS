'use client'

/**
 * Invoice Detail Page
 *
 * View and manage a single invoice
 */

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  FileText,
  Mail,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  Edit,
  Copy,
  Trash2,
  XCircle,
  CreditCard,
  User,
  Building2,
  Calendar,
  RefreshCw,
  Loader2,
  History,
  Plus,
  DollarSign,
} from 'lucide-react'
import {
  DOCUMENT_TYPE_LABELS,
  INVOICE_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  formatAmount,
} from '@/types/invoicing'

interface InvoiceDetail {
  id: string
  invoiceNumber: string
  documentType: string
  status: string
  issueDate: string
  dueDate: string
  taxableSupplyDate: string | null
  totalWithoutVat: number
  vatAmount: number
  totalAmount: number
  paidAmount: number
  paidAt: string | null
  currency: string
  paymentMethod: string
  bankAccount: string | null
  variableSymbol: string | null
  constantSymbol: string | null
  orderNumber: string | null
  note: string | null
  headerText: string | null
  footerText: string | null
  sentAt: string | null
  createdAt: string
  updatedAt: string
  customer: {
    id: string
    name: string
    email: string | null
    phone: string | null
    company: string | null
    ico: string | null
    dic: string | null
    street: string | null
    city: string | null
    postalCode: string | null
  } | null
  items: Array<{
    id: string
    description: string
    quantity: number
    unit: string
    unitPrice: number
    vatRate: number
    totalWithoutVat: number
    vatAmount: number
    totalWithVat: number
  }>
  payments: Array<{
    id: string
    amount: number
    paidAt: string
    paymentMethod: string
    note: string | null
  }>
}

export default function InvoiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const invoiceId = params.id as string

  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Payment modal
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0])
  const [paymentNote, setPaymentNote] = useState('')

  useEffect(() => {
    fetchInvoice()
  }, [invoiceId])

  async function fetchInvoice() {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/admin/invoicing/invoices/${invoiceId}`)
      if (!res.ok) throw new Error('Faktura nenalezena')

      const data = await res.json()
      setInvoice(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba při načítání')
    } finally {
      setLoading(false)
    }
  }

  // Handle actions
  const handleAction = async (action: string) => {
    setActionLoading(action)

    try {
      switch (action) {
        case 'send':
          const sendRes = await fetch(`/api/admin/invoicing/invoices/${invoiceId}?action=send`, {
            method: 'POST',
          })
          if (!sendRes.ok) throw new Error('Chyba při odesílání')
          break

        case 'markPaid':
          setShowPaymentModal(true)
          setPaymentAmount(((invoice?.totalAmount || 0) - (invoice?.paidAmount || 0)).toString())
          setActionLoading(null)
          return

        case 'cancel':
          if (!confirm('Opravdu chcete zrušit tuto fakturu?')) {
            setActionLoading(null)
            return
          }
          const cancelRes = await fetch(`/api/admin/invoicing/invoices/${invoiceId}?action=cancel`, {
            method: 'POST',
          })
          if (!cancelRes.ok) throw new Error('Chyba při rušení')
          break

        case 'duplicate':
          const dupRes = await fetch(`/api/admin/invoicing/invoices/${invoiceId}?action=duplicate`, {
            method: 'POST',
          })
          if (!dupRes.ok) throw new Error('Chyba při duplikování')
          const dupData = await dupRes.json()
          router.push(`/admin/invoicing/invoices/${dupData.id}`)
          return

        case 'delete':
          if (!confirm('Opravdu chcete smazat tuto fakturu?')) {
            setActionLoading(null)
            return
          }
          const delRes = await fetch(`/api/admin/invoicing/invoices/${invoiceId}`, {
            method: 'DELETE',
          })
          if (!delRes.ok) throw new Error('Chyba při mazání')
          router.push('/admin/invoicing/invoices')
          return
      }

      fetchInvoice()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Chyba při provádění akce')
    } finally {
      setActionLoading(null)
    }
  }

  // Handle payment submission
  const handlePaymentSubmit = async () => {
    setActionLoading('payment')

    try {
      const res = await fetch(`/api/admin/invoicing/invoices/${invoiceId}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(paymentAmount),
          paidAt: paymentDate,
          note: paymentNote || null,
        }),
      })

      if (!res.ok) throw new Error('Chyba při zaznamenávání platby')

      setShowPaymentModal(false)
      setPaymentAmount('')
      setPaymentNote('')
      fetchInvoice()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Chyba')
    } finally {
      setActionLoading(null)
    }
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    const config: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
      DRAFT: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-300', icon: Edit },
      SENT: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', icon: Mail },
      PAID: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', icon: CheckCircle2 },
      PARTIALLY_PAID: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', icon: Clock },
      OVERDUE: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', icon: AlertCircle },
      CANCELLED: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-500 dark:text-gray-400', icon: XCircle },
    }
    const c = config[status] || config.DRAFT
    const Icon = c.icon
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full ${c.bg} ${c.text}`}>
        <Icon className="w-4 h-4" />
        {INVOICE_STATUS_LABELS[status as keyof typeof INVOICE_STATUS_LABELS] || status}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error || !invoice) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Chyba
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-4">{error || 'Faktura nenalezena'}</p>
        <Link
          href="/admin/invoicing/invoices"
          className="text-blue-600 hover:text-blue-700"
        >
          Zpět na seznam faktur
        </Link>
      </div>
    )
  }

  const remainingAmount = invoice.totalAmount - invoice.paidAmount

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/invoicing/invoices"
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {invoice.invoiceNumber}
              </h1>
              {getStatusBadge(invoice.status)}
            </div>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {DOCUMENT_TYPE_LABELS[invoice.documentType as keyof typeof DOCUMENT_TYPE_LABELS]}
              {' · '}
              Vystaveno {new Date(invoice.issueDate).toLocaleDateString('cs-CZ')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* PDF Download */}
          <a
            href={`/api/admin/invoicing/invoices/${invoice.id}/pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            PDF
          </a>

          {/* Edit */}
          {['DRAFT'].includes(invoice.status) && (
            <Link
              href={`/admin/invoicing/invoices/${invoice.id}/edit`}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Upravit
            </Link>
          )}

          {/* Send */}
          {['DRAFT'].includes(invoice.status) && (
            <button
              onClick={() => handleAction('send')}
              disabled={actionLoading === 'send'}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {actionLoading === 'send' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Mail className="w-4 h-4" />
              )}
              Odeslat
            </button>
          )}

          {/* Mark Paid */}
          {['SENT', 'OVERDUE', 'PARTIALLY_PAID'].includes(invoice.status) && (
            <button
              onClick={() => handleAction('markPaid')}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              Zaznamenat platbu
            </button>
          )}

          {/* Duplicate */}
          <button
            onClick={() => handleAction('duplicate')}
            disabled={actionLoading === 'duplicate'}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            {actionLoading === 'duplicate' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            Duplikovat
          </button>

          {/* More actions */}
          <div className="relative group">
            <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <span className="sr-only">Více akcí</span>
              ···
            </button>

            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg hidden group-hover:block z-10">
              {invoice.status !== 'CANCELLED' && invoice.status !== 'PAID' && (
                <button
                  onClick={() => handleAction('cancel')}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-orange-700 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                >
                  <XCircle className="w-4 h-4" />
                  Zrušit fakturu
                </button>
              )}
              <button
                onClick={() => handleAction('delete')}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 className="w-4 h-4" />
                Smazat
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info */}
          {invoice.customer && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-green-600" />
                Odběratel
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {invoice.customer.name}
                  </p>
                  {invoice.customer.company && (
                    <p className="text-gray-600 dark:text-gray-400">
                      {invoice.customer.company}
                    </p>
                  )}
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    {[
                      invoice.customer.street,
                      invoice.customer.city,
                      invoice.customer.postalCode,
                    ]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                </div>

                <div className="space-y-1 text-sm">
                  {invoice.customer.ico && (
                    <p className="text-gray-600 dark:text-gray-400">
                      <span className="font-medium">IČO:</span> {invoice.customer.ico}
                    </p>
                  )}
                  {invoice.customer.dic && (
                    <p className="text-gray-600 dark:text-gray-400">
                      <span className="font-medium">DIČ:</span> {invoice.customer.dic}
                    </p>
                  )}
                  {invoice.customer.email && (
                    <p className="text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Email:</span> {invoice.customer.email}
                    </p>
                  )}
                  {invoice.customer.phone && (
                    <p className="text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Telefon:</span> {invoice.customer.phone}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Items */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Položky
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 font-medium text-gray-500 dark:text-gray-400">
                      Popis
                    </th>
                    <th className="text-right py-2 font-medium text-gray-500 dark:text-gray-400">
                      Množství
                    </th>
                    <th className="text-right py-2 font-medium text-gray-500 dark:text-gray-400">
                      Cena/MJ
                    </th>
                    <th className="text-right py-2 font-medium text-gray-500 dark:text-gray-400">
                      DPH
                    </th>
                    <th className="text-right py-2 font-medium text-gray-500 dark:text-gray-400">
                      Celkem
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-gray-100 dark:border-gray-700"
                    >
                      <td className="py-3 text-gray-900 dark:text-white">
                        {item.description}
                      </td>
                      <td className="py-3 text-right text-gray-600 dark:text-gray-400">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="py-3 text-right text-gray-600 dark:text-gray-400">
                        {formatAmount(item.unitPrice, invoice.currency)}
                      </td>
                      <td className="py-3 text-right text-gray-600 dark:text-gray-400">
                        {item.vatRate}%
                      </td>
                      <td className="py-3 text-right font-medium text-gray-900 dark:text-white">
                        {formatAmount(item.totalWithVat, invoice.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-gray-200 dark:border-gray-700">
                    <td colSpan={4} className="py-3 text-right text-gray-600 dark:text-gray-400">
                      Základ:
                    </td>
                    <td className="py-3 text-right font-medium text-gray-900 dark:text-white">
                      {formatAmount(invoice.totalWithoutVat, invoice.currency)}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={4} className="py-2 text-right text-gray-600 dark:text-gray-400">
                      DPH:
                    </td>
                    <td className="py-2 text-right font-medium text-gray-900 dark:text-white">
                      {formatAmount(invoice.vatAmount, invoice.currency)}
                    </td>
                  </tr>
                  <tr className="border-t border-gray-200 dark:border-gray-700">
                    <td colSpan={4} className="py-3 text-right text-lg font-semibold text-gray-900 dark:text-white">
                      Celkem:
                    </td>
                    <td className="py-3 text-right text-lg font-bold text-blue-600 dark:text-blue-400">
                      {formatAmount(invoice.totalAmount, invoice.currency)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Payment History */}
          {invoice.payments.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <History className="w-5 h-5 text-purple-600" />
                Historie plateb
              </h2>

              <div className="space-y-3">
                {invoice.payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatAmount(payment.amount, invoice.currency)}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(payment.paidAt).toLocaleDateString('cs-CZ')}
                        {payment.note && ` · ${payment.note}`}
                      </p>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {(invoice.note || invoice.headerText || invoice.footerText) && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Poznámky
              </h2>

              <div className="space-y-4 text-gray-600 dark:text-gray-400">
                {invoice.headerText && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Text před položkami:</p>
                    <p>{invoice.headerText}</p>
                  </div>
                )}
                {invoice.footerText && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Patička:</p>
                    <p>{invoice.footerText}</p>
                  </div>
                )}
                {invoice.note && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Poznámka:</p>
                    <p>{invoice.note}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Payment Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Stav úhrady
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Celkem:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatAmount(invoice.totalAmount, invoice.currency)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Uhrazeno:</span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  {formatAmount(invoice.paidAmount, invoice.currency)}
                </span>
              </div>

              {remainingAmount > 0 && (
                <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span className="font-medium text-gray-900 dark:text-white">Zbývá:</span>
                  <span className="font-bold text-red-600 dark:text-red-400">
                    {formatAmount(remainingAmount, invoice.currency)}
                  </span>
                </div>
              )}

              {/* Progress bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, (invoice.paidAmount / invoice.totalAmount) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              Platební údaje
            </h3>

            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500 dark:text-gray-400">Způsob platby:</dt>
                <dd className="text-gray-900 dark:text-white">
                  {PAYMENT_METHOD_LABELS[invoice.paymentMethod as keyof typeof PAYMENT_METHOD_LABELS]}
                </dd>
              </div>

              {invoice.bankAccount && (
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">Účet:</dt>
                  <dd className="text-gray-900 dark:text-white font-mono">
                    {invoice.bankAccount}
                  </dd>
                </div>
              )}

              {invoice.variableSymbol && (
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">VS:</dt>
                  <dd className="text-gray-900 dark:text-white font-mono">
                    {invoice.variableSymbol}
                  </dd>
                </div>
              )}

              {invoice.constantSymbol && (
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">KS:</dt>
                  <dd className="text-gray-900 dark:text-white font-mono">
                    {invoice.constantSymbol}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Dates */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              Důležité datumy
            </h3>

            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500 dark:text-gray-400">Vystaveno:</dt>
                <dd className="text-gray-900 dark:text-white">
                  {new Date(invoice.issueDate).toLocaleDateString('cs-CZ')}
                </dd>
              </div>

              <div className="flex justify-between">
                <dt className="text-gray-500 dark:text-gray-400">Splatnost:</dt>
                <dd className={`font-medium ${
                  invoice.status === 'OVERDUE'
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-gray-900 dark:text-white'
                }`}>
                  {new Date(invoice.dueDate).toLocaleDateString('cs-CZ')}
                </dd>
              </div>

              {invoice.taxableSupplyDate && (
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">DUZP:</dt>
                  <dd className="text-gray-900 dark:text-white">
                    {new Date(invoice.taxableSupplyDate).toLocaleDateString('cs-CZ')}
                  </dd>
                </div>
              )}

              {invoice.sentAt && (
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">Odesláno:</dt>
                  <dd className="text-gray-900 dark:text-white">
                    {new Date(invoice.sentAt).toLocaleDateString('cs-CZ')}
                  </dd>
                </div>
              )}

              {invoice.paidAt && (
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">Uhrazeno:</dt>
                  <dd className="text-green-600 dark:text-green-400">
                    {new Date(invoice.paidAt).toLocaleDateString('cs-CZ')}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Zaznamenat platbu
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Částka ({invoice.currency})
                </label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  step="0.01"
                  min="0"
                  max={remainingAmount}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Zbývá uhradit: {formatAmount(remainingAmount, invoice.currency)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Datum platby
                </label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Poznámka (volitelné)
                </label>
                <input
                  type="text"
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  placeholder="Např. číslo transakce"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                Zrušit
              </button>
              <button
                onClick={handlePaymentSubmit}
                disabled={actionLoading === 'payment' || !paymentAmount}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {actionLoading === 'payment' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                Potvrdit platbu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
