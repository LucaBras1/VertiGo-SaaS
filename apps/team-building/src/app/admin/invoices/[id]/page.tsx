/**
 * Invoice Detail Page
 * View and edit invoice details
 */

'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Save,
  Trash2,
  Building2,
  Send,
  Check,
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
  paidDate: string | null
  items: {
    description: string
    quantity: number
    unitPrice: number
    totalPrice: number
  }[]
  subtotal: number
  vatRate: number
  vatAmount: number
  totalAmount: number
  paidAmount: number
  currency: string
  textBeforeItems: string | null
  textAfterItems: string | null
  notes: string | null
  customer: {
    id: string
    firstName: string
    lastName: string
    email: string
    organization: string | null
  }
  order: {
    id: string
    orderNumber: string
    sessionName: string | null
  } | null
}

const statusOptions = [
  { value: 'draft', label: 'Koncept' },
  { value: 'sent', label: 'Odesláno' },
  { value: 'paid', label: 'Zaplaceno' },
  { value: 'overdue', label: 'Po splatnosti' },
  { value: 'cancelled', label: 'Zrušeno' },
]

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [editData, setEditData] = useState({
    status: '',
    dueDate: '',
    paidAmount: '',
    notes: '',
  })

  useEffect(() => {
    fetchInvoice()
  }, [id])

  const fetchInvoice = async () => {
    try {
      const response = await fetch(`/api/invoices/${id}`)
      const data = await response.json()

      if (data.success) {
        setInvoice(data.data)
        setEditData({
          status: data.data.status,
          dueDate: data.data.dueDate.split('T')[0],
          paidAmount: data.data.paidAmount.toString(),
          notes: data.data.notes || '',
        })
      } else {
        toast.error('Faktura nebyla nalezena')
        router.push('/admin/invoices')
      }
    } catch (error) {
      toast.error('Chyba při načítání faktury')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/invoices/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editData,
          paidAmount: parseInt(editData.paidAmount) || 0,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Faktura byla uložena')
        fetchInvoice()
      } else {
        toast.error(data.error || 'Nepodařilo se uložit fakturu')
      }
    } catch (error) {
      toast.error('Chyba při ukládání')
    } finally {
      setIsSaving(false)
    }
  }

  const handleMarkAsPaid = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/invoices/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'paid',
          paidAmount: invoice?.totalAmount,
          paidDate: new Date().toISOString(),
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Faktura byla označena jako zaplacená')
        fetchInvoice()
      } else {
        toast.error(data.error || 'Nepodařilo se označit fakturu')
      }
    } catch (error) {
      toast.error('Chyba při aktualizaci')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/invoices/${id}`, {
        method: 'DELETE',
      })
      const data = await response.json()

      if (data.success) {
        toast.success('Faktura byla smazána')
        router.push('/admin/invoices')
      } else {
        toast.error(data.error || 'Nepodařilo se smazat fakturu')
      }
    } catch (error) {
      toast.error('Chyba při mazání')
    } finally {
      setShowDeleteDialog(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: invoice?.currency || 'CZK',
      minimumFractionDigits: 0,
    }).format(amount / 100)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    )
  }

  if (!invoice) {
    return null
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/invoices">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Faktura {invoice.invoiceNumber}
            </h1>
            <p className="text-gray-600">
              Vystaveno {new Date(invoice.issueDate).toLocaleDateString('cs-CZ')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {invoice.status === 'draft' && (
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(true)}
              className="text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Smazat
            </Button>
          )}
          {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
            <Button variant="outline" onClick={handleMarkAsPaid} disabled={isSaving}>
              <Check className="w-4 h-4 mr-2" />
              Označit jako zaplaceno
            </Button>
          )}
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Ukládám...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Uložit změny
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Stav faktury</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Stav
                </label>
                <select
                  value={editData.status}
                  onChange={(e) => setEditData(prev => ({ ...prev, status: e.target.value }))}
                  className="input-field"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Splatnost
                </label>
                <input
                  type="date"
                  value={editData.dueDate}
                  onChange={(e) => setEditData(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Uhrazená částka (haléře)
                </label>
                <input
                  type="number"
                  value={editData.paidAmount}
                  onChange={(e) => setEditData(prev => ({ ...prev, paidAmount: e.target.value }))}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Položky faktury</h2>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 text-sm font-semibold text-gray-700">
                      Popis
                    </th>
                    <th className="text-center py-2 text-sm font-semibold text-gray-700">
                      Množství
                    </th>
                    <th className="text-right py-2 text-sm font-semibold text-gray-700">
                      Cena/ks
                    </th>
                    <th className="text-right py-2 text-sm font-semibold text-gray-700">
                      Celkem
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-3">{item.description}</td>
                      <td className="py-3 text-center">{item.quantity}</td>
                      <td className="py-3 text-right">{formatCurrency(item.unitPrice)}</td>
                      <td className="py-3 text-right font-semibold">
                        {formatCurrency(item.totalPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-gray-200">
                    <td colSpan={3} className="py-2 text-right text-gray-600">
                      Mezisoučet
                    </td>
                    <td className="py-2 text-right font-semibold">
                      {formatCurrency(invoice.subtotal)}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="py-2 text-right text-gray-600">
                      DPH ({invoice.vatRate}%)
                    </td>
                    <td className="py-2 text-right font-semibold">
                      {formatCurrency(invoice.vatAmount)}
                    </td>
                  </tr>
                  <tr className="border-t-2 border-gray-200">
                    <td colSpan={3} className="py-3 text-right font-bold text-lg">
                      Celkem k úhradě
                    </td>
                    <td className="py-3 text-right font-bold text-lg text-brand-primary">
                      {formatCurrency(invoice.totalAmount)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Notes */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Poznámky</h2>
            <textarea
              value={editData.notes}
              onChange={(e) => setEditData(prev => ({ ...prev, notes: e.target.value }))}
              className="input-field"
              rows={3}
              placeholder="Interní poznámky..."
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer */}
          <div className="card">
            <h2 className="text-lg font-bold mb-4">Zákazník</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-gray-400" />
                <span className="font-semibold">
                  {invoice.customer.organization || `${invoice.customer.firstName} ${invoice.customer.lastName}`}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                {invoice.customer.email}
              </div>
              <Link href={`/admin/customers/${invoice.customer.id}`}>
                <Button variant="outline" size="sm" className="w-full mt-2">
                  Zobrazit zákazníka
                </Button>
              </Link>
            </div>
          </div>

          {/* Linked Order */}
          {invoice.order && (
            <div className="card">
              <h2 className="text-lg font-bold mb-4">Objednávka</h2>
              <div className="space-y-2">
                <div className="font-semibold">{invoice.order.orderNumber}</div>
                {invoice.order.sessionName && (
                  <div className="text-sm text-gray-600">{invoice.order.sessionName}</div>
                )}
                <Link href={`/admin/orders/${invoice.order.id}`}>
                  <Button variant="outline" size="sm" className="w-full mt-2">
                    Zobrazit objednávku
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Payment Status */}
          <div className="card">
            <h2 className="text-lg font-bold mb-4">Platba</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">K úhradě:</span>
                <span className="font-semibold">{formatCurrency(invoice.totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Uhrazeno:</span>
                <span className="font-semibold text-emerald-600">
                  {formatCurrency(invoice.paidAmount)}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-gray-600">Zbývá:</span>
                <span className={`font-bold ${invoice.totalAmount - invoice.paidAmount > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                  {formatCurrency(invoice.totalAmount - invoice.paidAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Smazat fakturu"
        message="Opravdu chcete smazat tento koncept faktury? Tato akce je nevratná."
        confirmText="Smazat"
        variant="danger"
      />
    </div>
  )
}
