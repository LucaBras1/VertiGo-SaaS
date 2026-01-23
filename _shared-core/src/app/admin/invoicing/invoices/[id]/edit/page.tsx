'use client'

/**
 * Edit Invoice Page
 *
 * Edit an existing invoice
 */

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { RefreshCw, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { InvoiceForm } from '@/components/admin/invoicing/invoices/InvoiceForm'

export default function EditInvoicePage() {
  const params = useParams()
  const router = useRouter()
  const invoiceId = params.id as string

  const [invoice, setInvoice] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

      // Check if invoice can be edited
      if (!['DRAFT'].includes(data.status)) {
        setError('Tuto fakturu nelze upravovat (pouze koncepty lze editovat)')
        return
      }

      // Transform data for form
      setInvoice({
        id: data.id,
        documentType: data.documentType,
        customerId: data.customer?.id || null,
        numberSeriesId: data.numberSeriesId || null,
        templateId: data.templateId || null,
        issueDate: data.issueDate.split('T')[0],
        dueDate: data.dueDate.split('T')[0],
        taxableSupplyDate: data.taxableSupplyDate?.split('T')[0] || data.issueDate.split('T')[0],
        paymentMethod: data.paymentMethod,
        currency: data.currency,
        bankAccount: data.bankAccount || '',
        variableSymbol: data.variableSymbol || '',
        constantSymbol: data.constantSymbol || '',
        specificSymbol: data.specificSymbol || '',
        orderNumber: data.orderNumber || '',
        note: data.note || '',
        internalNote: data.internalNote || '',
        headerText: data.headerText || '',
        footerText: data.footerText || '',
        items: data.items.map((item: any) => ({
          id: item.id,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.unitPrice,
          vatRate: item.vatRate,
          discount: item.discount || 0,
          discountType: item.discountType || 'PERCENTAGE',
          totalWithoutVat: item.totalWithoutVat,
          vatAmount: item.vatAmount,
          totalWithVat: item.totalWithVat,
        })),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba při načítání')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Chyba
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
        <Link
          href={`/admin/invoicing/invoices/${invoiceId}`}
          className="text-blue-600 hover:text-blue-700"
        >
          Zpět na detail faktury
        </Link>
      </div>
    )
  }

  if (!invoice) {
    return null
  }

  return <InvoiceForm invoice={invoice} mode="edit" />
}
