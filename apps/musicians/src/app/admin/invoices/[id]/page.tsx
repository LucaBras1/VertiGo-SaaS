'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Edit, Trash2, Download, Send, CheckCircle, FileText, Mail, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from '@/components/ui/dialog'
import { InvoicePaymentButton } from '@/components/payments'
import { formatCurrency, formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

interface InvoiceItem {
  description: string
  quantity: number
  unitPrice: number
  total: number
}

interface Invoice {
  id: string
  invoiceNumber: string
  status: string
  issueDate: string
  dueDate: string
  paidDate?: string
  subtotal: number
  taxRate: number
  taxAmount: number
  totalAmount: number
  paidAmount: number
  items: InvoiceItem[]
  notes?: string
  customer: {
    id: string
    firstName: string
    lastName: string
    email: string
    company?: string
  }
  gig?: {
    id: string
    title: string
  }
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'warning' | 'success' | 'danger' }> = {
  draft: { label: 'Koncept', variant: 'default' },
  sent: { label: 'Odesláno', variant: 'warning' },
  paid: { label: 'Zaplaceno', variant: 'success' },
  overdue: { label: 'Po splatnosti', variant: 'danger' },
}

export default function InvoiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSendingEmail, setIsSendingEmail] = useState(false)

  useEffect(() => {
    fetchInvoice()
  }, [params.id])

  const fetchInvoice = async () => {
    try {
      const response = await fetch(`/api/invoices/${params.id}`)
      if (!response.ok) {
        if (response.status === 404) {
          router.push('/admin/invoices')
          return
        }
        throw new Error('Failed to fetch')
      }
      setInvoice(await response.json())
    } catch (error) {
      toast.error('Nepodařilo se načíst fakturu')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/invoices/${params.id}`, { method: 'DELETE' })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete')
      }
      toast.success('Faktura smazána')
      router.push('/admin/invoices')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Nepodařilo se smazat')
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/invoices/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!response.ok) throw new Error('Failed to update')
      setInvoice(await response.json())
      toast.success('Status aktualizován')
    } catch (error) {
      toast.error('Nepodařilo se aktualizovat')
    }
  }

  const handleSendEmail = async () => {
    if (!invoice?.customer?.email) {
      toast.error('Zákazník nemá emailovou adresu')
      return
    }

    setIsSendingEmail(true)
    try {
      const response = await fetch(`/api/invoices/${params.id}/send`, {
        method: 'POST',
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send email')
      }

      // Refresh invoice data to get updated status
      await fetchInvoice()
      toast.success(`Faktura odeslána na ${invoice.customer.email}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Nepodařilo se odeslat email')
    } finally {
      setIsSendingEmail(false)
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>
  }

  if (!invoice) return null

  const items = invoice.items as InvoiceItem[]
  const status = statusConfig[invoice.status] || statusConfig.draft

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <Link href="/admin/invoices" className="inline-flex items-center text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:text-neutral-300 mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Zpět na faktury
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{invoice.invoiceNumber}</h1>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Vystaveno: {formatDate(new Date(invoice.issueDate))}
          </p>
        </div>
        <div className="flex gap-2">
          {invoice.status !== 'paid' && (
            <Link href={`/admin/invoices/${invoice.id}/edit`}>
              <Button variant="outline"><Edit className="h-4 w-4 mr-2" />Upravit</Button>
            </Link>
          )}
          {invoice.status !== 'paid' && (
            <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
              <Trash2 className="h-4 w-4 mr-2" />Smazat
            </Button>
          )}
        </div>
      </div>

      {/* Status Actions */}
      {invoice.status !== 'paid' && (
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-sm text-neutral-600 dark:text-neutral-400">Akce:</span>
              {invoice.status === 'draft' && (
                <>
                  <Button size="sm" onClick={() => handleStatusChange('sent')}>
                    <Send className="h-4 w-4 mr-2" />Označit jako odesláno
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleSendEmail}
                    disabled={isSendingEmail || !invoice.customer?.email}
                  >
                    {isSendingEmail ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Mail className="h-4 w-4 mr-2" />
                    )}
                    Odeslat emailem
                  </Button>
                </>
              )}
              {(invoice.status === 'sent' || invoice.status === 'overdue') && (
                <>
                  <Button size="sm" onClick={() => handleStatusChange('paid')}>
                    <CheckCircle className="h-4 w-4 mr-2" />Označit jako zaplaceno
                  </Button>
                  <InvoicePaymentButton
                    invoiceId={invoice.id}
                    totalAmount={invoice.totalAmount}
                    paidAmount={invoice.paidAmount}
                    status={invoice.status}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleSendEmail}
                    disabled={isSendingEmail || !invoice.customer?.email}
                  >
                    {isSendingEmail ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Mail className="h-4 w-4 mr-2" />
                    )}
                    Poslat připomínku
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Invoice Items */}
          <Card>
            <CardHeader><CardTitle>Položky</CardTitle></CardHeader>
            <CardContent>
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 text-sm font-medium text-neutral-500 dark:text-neutral-400">Popis</th>
                    <th className="text-right py-2 text-sm font-medium text-neutral-500 dark:text-neutral-400">Množství</th>
                    <th className="text-right py-2 text-sm font-medium text-neutral-500 dark:text-neutral-400">Cena/ks</th>
                    <th className="text-right py-2 text-sm font-medium text-neutral-500 dark:text-neutral-400">Celkem</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-3">{item.description}</td>
                      <td className="py-3 text-right">{item.quantity}</td>
                      <td className="py-3 text-right">{formatCurrency(item.unitPrice / 100)}</td>
                      <td className="py-3 text-right font-medium">{formatCurrency(item.total / 100)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3} className="py-2 text-right text-neutral-600 dark:text-neutral-400">Mezisoučet:</td>
                    <td className="py-2 text-right">{formatCurrency(invoice.subtotal / 100)}</td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="py-2 text-right text-neutral-600 dark:text-neutral-400">DPH ({invoice.taxRate}%):</td>
                    <td className="py-2 text-right">{formatCurrency(invoice.taxAmount / 100)}</td>
                  </tr>
                  <tr className="font-bold text-lg">
                    <td colSpan={3} className="py-3 text-right">Celkem:</td>
                    <td className="py-3 text-right">{formatCurrency(invoice.totalAmount / 100)}</td>
                  </tr>
                </tfoot>
              </table>
            </CardContent>
          </Card>

          {invoice.notes && (
            <Card>
              <CardHeader><CardTitle>Poznámky</CardTitle></CardHeader>
              <CardContent><p className="whitespace-pre-wrap">{invoice.notes}</p></CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {/* Customer */}
          <Card>
            <CardHeader><CardTitle>Odběratel</CardTitle></CardHeader>
            <CardContent>
              <p className="font-medium">{invoice.customer.firstName} {invoice.customer.lastName}</p>
              {invoice.customer.company && <p className="text-neutral-600 dark:text-neutral-400">{invoice.customer.company}</p>}
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">{invoice.customer.email}</p>
              <Link href={`/admin/clients/${invoice.customer.id}`} className="text-primary-600 hover:underline text-sm">
                Zobrazit profil
              </Link>
            </CardContent>
          </Card>

          {/* Dates */}
          <Card>
            <CardHeader><CardTitle>Termíny</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">Vystaveno:</span>
                <span>{formatDate(new Date(invoice.issueDate))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">Splatnost:</span>
                <span>{formatDate(new Date(invoice.dueDate))}</span>
              </div>
              {invoice.paidDate && (
                <div className="flex justify-between">
                  <span className="text-neutral-600 dark:text-neutral-400">Zaplaceno:</span>
                  <span className="text-green-600">{formatDate(new Date(invoice.paidDate))}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Linked Gig */}
          {invoice.gig && (
            <Card>
              <CardHeader><CardTitle>Propojený gig</CardTitle></CardHeader>
              <CardContent>
                <Link href={`/admin/gigs/${invoice.gig.id}`} className="text-primary-600 hover:underline">
                  {invoice.gig.title}
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
        <DialogHeader><DialogTitle>Smazat fakturu?</DialogTitle></DialogHeader>
        <DialogContent><p>Opravdu chcete smazat fakturu {invoice.invoiceNumber}?</p></DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Zrušit</Button>
          <Button variant="destructive" onClick={handleDelete} isLoading={isDeleting}>Smazat</Button>
        </DialogFooter>
      </Dialog>
    </div>
  )
}
