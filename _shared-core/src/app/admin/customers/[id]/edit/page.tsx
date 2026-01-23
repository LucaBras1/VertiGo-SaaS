'use client'

/**
 * Customer Edit Page
 * Form for editing existing customer
 */

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { CustomerForm } from '@/components/admin/CustomerForm'
import type { Customer } from '@/types/admin'

export default function CustomerEditPage() {
  const params = useParams()
  const customerId = params.id as string

  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const response = await fetch(`/api/admin/customers/${customerId}`)

        if (!response.ok) {
          throw new Error('Zakaznik nenalezen')
        }

        const data = await response.json()
        setCustomer({
          ...data.data,
          id: data.data.id || data.data._id, // CustomerForm expects 'id' property (fallback for legacy _id)
        })
      } catch (err) {
        console.error('Error fetching customer:', err)
        setError(err instanceof Error ? err.message : 'Chyba pri nacitani zakaznika')
      } finally {
        setLoading(false)
      }
    }

    if (customerId) {
      fetchCustomer()
    }
  }, [customerId])

  if (loading) {
    return (
      <div className="px-4 py-8 sm:px-0">
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-2 text-sm text-gray-500">Nacitani zakaznika...</p>
        </div>
      </div>
    )
  }

  if (error || !customer) {
    return (
      <div className="px-4 py-8 sm:px-0">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error || 'Zakaznik nenalezen'}</p>
          <Link
            href="/admin/customers"
            className="text-blue-600 hover:text-blue-900"
          >
            &larr; Zpet na seznam zakazniku
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-8 sm:px-0">
      <div className="mb-6">
        <Link
          href={`/admin/customers/${customerId}`}
          className="text-sm text-blue-600 hover:text-blue-900 mb-2 inline-block"
        >
          &larr; Zpet na detail zakaznika
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">
          Upravit zakaznika
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          {customer.firstName} {customer.lastName}
          {customer.organization && ` - ${customer.organization}`}
        </p>
      </div>

      <CustomerForm customer={customer} />
    </div>
  )
}
