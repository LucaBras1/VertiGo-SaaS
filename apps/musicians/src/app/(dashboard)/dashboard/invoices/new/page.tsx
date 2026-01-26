'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { InvoiceForm } from '@/components/forms/InvoiceForm'

export default function NewInvoicePage() {
  const searchParams = useSearchParams()
  const customerId = searchParams.get('customerId')
  const gigId = searchParams.get('gigId')

  const [clients, setClients] = useState([])
  const [gigs, setGigs] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/clients').then(r => r.json()),
      fetch('/api/gigs').then(r => r.json()),
    ]).then(([clientsData, gigsData]) => {
      setClients(clientsData.clients || [])
      setGigs(gigsData.gigs || [])
      setIsLoading(false)
    }).catch(() => setIsLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/invoices"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Zpět na faktury
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Nová faktura</h1>
        <p className="text-gray-600 mt-1">Vytvořte novou fakturu</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="max-w-3xl">
          <InvoiceForm
            clients={clients}
            gigs={gigs}
            initialData={{
              customerId: customerId || '',
              gigId: gigId || '',
            }}
          />
        </div>
      )}
    </div>
  )
}
