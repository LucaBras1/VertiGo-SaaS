'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { InvoiceForm } from '@/components/forms/InvoiceForm'
import toast from 'react-hot-toast'

export default function EditInvoicePage() {
  const params = useParams()
  const router = useRouter()
  const [invoice, setInvoice] = useState<any>(null)
  const [clients, setClients] = useState([])
  const [gigs, setGigs] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch(`/api/invoices/${params.id}`).then(r => r.ok ? r.json() : null),
      fetch('/api/clients').then(r => r.json()),
      fetch('/api/gigs').then(r => r.json()),
    ]).then(([invoiceData, clientsData, gigsData]) => {
      if (!invoiceData) {
        router.push('/dashboard/invoices')
        return
      }
      // Transform invoice data to match form structure
      const transformedInvoice = {
        ...invoiceData,
        customerId: invoiceData.customer?.id || invoiceData.customerId,
        gigId: invoiceData.gig?.id || invoiceData.gigId || '',
      }
      setInvoice(transformedInvoice)
      setClients(clientsData.clients || [])
      setGigs(gigsData.gigs || [])
      setIsLoading(false)
    }).catch(() => {
      toast.error('Nepodařilo se načíst data')
      setIsLoading(false)
    })
  }, [params.id, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!invoice) return null

  // Check if invoice is already paid
  if (invoice.status === 'paid') {
    return (
      <div className="space-y-6">
        <div>
          <Link
            href={`/dashboard/invoices/${params.id}`}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Zpět na detail
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Nelze upravit</h1>
          <p className="text-gray-600 mt-1">Zaplacené faktury nelze upravovat</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/dashboard/invoices/${params.id}`}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Zpět na detail
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Upravit fakturu</h1>
        <p className="text-gray-600 mt-1">Upravte údaje faktury</p>
      </div>

      <div className="max-w-3xl">
        <InvoiceForm
          clients={clients}
          gigs={gigs}
          initialData={invoice}
        />
      </div>
    </div>
  )
}
