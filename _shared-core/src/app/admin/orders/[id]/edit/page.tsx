'use client'

/**
 * Order Edit Page
 * Loads existing order and displays OrderForm for editing
 */

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Breadcrumbs } from '@/components/admin/navigation/Breadcrumbs'
import { OrderForm } from '@/components/admin/OrderForm'

export default function EditOrderPage() {
  const params = useParams()
  const orderId = params.id as string

  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/admin/orders/${orderId}?populate=true`)

        if (!response.ok) {
          throw new Error('Nepodařilo se načíst objednávku')
        }

        const data = await response.json()
        setOrder(data.order)
      } catch (err) {
        console.error('Error fetching order:', err)
        setError(err instanceof Error ? err.message : 'Chyba při načítání objednávky')
      } finally {
        setLoading(false)
      }
    }

    if (orderId) {
      fetchOrder()
    }
  }, [orderId])

  if (loading) {
    return (
      <div className="px-4 py-8 sm:px-0">
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-2 text-sm text-gray-500">Načítání objednávky...</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="px-4 py-8 sm:px-0">
        <div className="text-center py-12">
          <p className="text-red-600">{error || 'Objednávka nenalezena'}</p>
          <Link
            href="/admin/orders"
            className="mt-4 inline-block text-blue-600 hover:text-blue-900"
          >
            ← Zpět na seznam objednávek
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-8 sm:px-0">
      <Breadcrumbs className="mb-6" />

      <div className="mb-8">
        <Link
          href={`/admin/orders/${orderId}`}
          className="text-sm text-blue-600 hover:text-blue-900 mb-2 inline-block"
        >
          ← Zpět na detail objednávky
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">
          Upravit objednávku {order.orderNumber}
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Upravte údaje objednávky
        </p>
      </div>

      <OrderForm order={order} />
    </div>
  )
}
