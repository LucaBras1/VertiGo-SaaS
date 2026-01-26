'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Edit, Trash2, Send, Download, CheckCircle,
  Clock, AlertCircle, XCircle, FileText, User, Package
} from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import toast from 'react-hot-toast'

interface LineItem {
  description: string
  quantity: number
  unitPrice: number
}

interface Invoice {
  id: string
  invoiceNumber: string
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED'
  items: LineItem[]
  subtotal: number
  tax: number
  total: number
  dueDate: string | null
  paidAt: string | null
  notes: string | null
  createdAt: string
  client: {
    id: string
    name: string
    email: string
    phone: string | null
    address: string | null
  }
  package: {
    id: string
    title: string
    eventType: string | null
  } | null
}

const statusConfig = {
  DRAFT: { label: 'Draft', color: 'gray' as const, icon: FileText },
  SENT: { label: 'Sent', color: 'blue' as const, icon: Clock },
  PAID: { label: 'Paid', color: 'green' as const, icon: CheckCircle },
  OVERDUE: { label: 'Overdue', color: 'red' as const, icon: AlertCircle },
  CANCELLED: { label: 'Cancelled', color: 'gray' as const, icon: XCircle }
}

export default function InvoiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showSendModal, setShowSendModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  useEffect(() => {
    fetchInvoice()
  }, [params.id])

  const fetchInvoice = async () => {
    try {
      const res = await fetch(`/api/invoices/${params.id}`)
      if (!res.ok) throw new Error('Invoice not found')
      const data = await res.json()
      setInvoice(data)
    } catch (error) {
      console.error('Failed to fetch invoice:', error)
      toast.error('Invoice not found')
      router.push('/dashboard/invoices')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!invoice) return
    setIsUpdatingStatus(true)
    try {
      const res = await fetch(`/api/invoices/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          paidAt: newStatus === 'PAID' ? new Date().toISOString() : invoice.paidAt
        })
      })
      if (!res.ok) throw new Error('Failed to update status')
      setInvoice({
        ...invoice,
        status: newStatus as Invoice['status'],
        paidAt: newStatus === 'PAID' ? new Date().toISOString() : invoice.paidAt
      })
      toast.success('Status updated')
    } catch (error) {
      toast.error('Failed to update status')
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleSendInvoice = async () => {
    setIsSending(true)
    try {
      // In a real app, this would send an email
      await handleStatusChange('SENT')
      toast.success('Invoice sent to client')
      setShowSendModal(false)
    } catch (error) {
      toast.error('Failed to send invoice')
    } finally {
      setIsSending(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/invoices/${params.id}`, {
        method: 'DELETE'
      })
      if (!res.ok) throw new Error('Failed to delete invoice')
      toast.success('Invoice deleted')
      router.push('/dashboard/invoices')
    } catch (error) {
      toast.error('Failed to delete invoice')
    } finally {
      setIsDeleting(false)
      setShowDeleteModal(false)
    }
  }

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

  if (!invoice) return null

  const StatusIcon = statusConfig[invoice.status].icon

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link href="/dashboard/invoices" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Invoices
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">{invoice.invoiceNumber}</h1>
            <Badge variant={statusConfig[invoice.status].color}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {statusConfig[invoice.status].label}
            </Badge>
          </div>
          <p className="text-gray-600 mt-1">{invoice.client.name}</p>
        </div>
        <div className="flex items-center gap-2">
          {invoice.status === 'DRAFT' && (
            <Button onClick={() => setShowSendModal(true)}>
              <Send className="w-4 h-4 mr-2" />
              Send Invoice
            </Button>
          )}
          <Link href={`/dashboard/invoices/${params.id}/edit`}>
            <Button variant="secondary">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button variant="secondary">
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
          <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Status Controls */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Status:</span>
            <select
              value={invoice.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={isUpdatingStatus}
              className="px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="DRAFT">Draft</option>
              <option value="SENT">Sent</option>
              <option value="PAID">Paid</option>
              <option value="OVERDUE">Overdue</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          {invoice.status === 'SENT' && (
            <Button onClick={() => handleStatusChange('PAID')}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark as Paid
            </Button>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invoice Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Line Items */}
          <Card>
            <CardHeader>
              <CardTitle>Line Items</CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left p-3 font-medium text-gray-600">Description</th>
                    <th className="text-center p-3 font-medium text-gray-600 w-24">Qty</th>
                    <th className="text-right p-3 font-medium text-gray-600 w-32">Price</th>
                    <th className="text-right p-3 font-medium text-gray-600 w-32">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="p-3">{item.description}</td>
                      <td className="p-3 text-center">{item.quantity}</td>
                      <td className="p-3 text-right">{formatCurrency(item.unitPrice)}</td>
                      <td className="p-3 text-right font-medium">{formatCurrency(item.quantity * item.unitPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="border-t p-4">
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>{formatCurrency(invoice.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span>{formatCurrency(invoice.tax)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold border-t pt-2">
                    <span>Total</span>
                    <span>{formatCurrency(invoice.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Notes */}
          {invoice.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <p className="text-gray-700 whitespace-pre-wrap">{invoice.notes}</p>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Client Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Bill To
              </CardTitle>
            </CardHeader>
            <div className="space-y-2">
              <Link href={`/dashboard/clients/${invoice.client.id}`}
                className="font-medium text-amber-600 hover:text-amber-700">
                {invoice.client.name}
              </Link>
              <p className="text-sm text-gray-600">{invoice.client.email}</p>
              {invoice.client.phone && (
                <p className="text-sm text-gray-600">{invoice.client.phone}</p>
              )}
              {invoice.client.address && (
                <p className="text-sm text-gray-600">{invoice.client.address}</p>
              )}
            </div>
          </Card>

          {/* Package Info */}
          {invoice.package && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Package
                </CardTitle>
              </CardHeader>
              <Link href={`/dashboard/packages/${invoice.package.id}`}
                className="block p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                <p className="font-medium">{invoice.package.title}</p>
                {invoice.package.eventType && (
                  <p className="text-sm text-gray-500">{invoice.package.eventType}</p>
                )}
              </Link>
            </Card>
          )}

          {/* Invoice Info */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
            </CardHeader>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Invoice Date</span>
                <span className="font-medium">{new Date(invoice.createdAt).toLocaleDateString()}</span>
              </div>
              {invoice.dueDate && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Due Date</span>
                  <span className="font-medium">{new Date(invoice.dueDate).toLocaleDateString()}</span>
                </div>
              )}
              {invoice.paidAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Paid On</span>
                  <span className="font-medium text-green-600">{new Date(invoice.paidAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Send Modal */}
      <Modal isOpen={showSendModal} onClose={() => setShowSendModal(false)} title="Send Invoice">
        <div className="space-y-4">
          <p className="text-gray-600">
            Send invoice {invoice.invoiceNumber} to <strong>{invoice.client.email}</strong>?
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowSendModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendInvoice} isLoading={isSending}>
              <Send className="w-4 h-4 mr-2" />
              Send Invoice
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Invoice">
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete invoice {invoice.invoiceNumber}?
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} isLoading={isDeleting}>
              Delete Invoice
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
