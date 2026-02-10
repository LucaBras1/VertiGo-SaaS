/**
 * Admin Orders Page
 */

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Eye, ShoppingCart } from 'lucide-react'
import { Badge, Card } from '@vertigo/ui'

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  async function fetchOrders() {
    try {
      const response = await fetch('/api/orders')
      const data = await response.json()
      setOrders(data)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      new: 'warning',
      confirmed: 'success',
      completed: 'info',
      cancelled: 'danger',
    }
    return <Badge variant={variants[status]}>{status}</Badge>
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-partypal-pink-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Objednávky</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">Správa objednávek</p>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase">
                  Číslo objednávky
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase">
                  Zákazník
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase">
                  Datum
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase">
                  Celkem
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase">
                  Stav
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase">
                  Akce
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <ShoppingCart className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
                      <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                        {order.orderNumber}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-neutral-700 dark:text-neutral-300">
                    {order.customer.firstName} {order.customer.lastName}
                  </td>
                  <td className="px-6 py-4 text-neutral-600 dark:text-neutral-400 text-sm">
                    {new Date(order.createdAt).toLocaleDateString('cs-CZ')}
                  </td>
                  <td className="px-6 py-4 font-semibold text-neutral-900 dark:text-neutral-100">
                    {order.total.toLocaleString('cs-CZ')} Kč
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-partypal-pink-600 hover:text-partypal-pink-700 font-medium text-sm"
                    >
                      Detail
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
