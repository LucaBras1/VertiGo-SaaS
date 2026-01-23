/**
 * Recent Orders Component
 * Displays list of recent orders
 */

'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ShoppingCart } from 'lucide-react'
import Link from 'next/link'

interface Order {
  id: string
  orderNumber: string
  createdAt: Date
  status: string
  pricing?: unknown
  customer: {
    firstName: string
    lastName: string
  } | null
}

export default function RecentOrders({ orders }: { orders: Order[] }) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('cs-CZ', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date))
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'danger'> = {
      confirmed: 'success',
      new: 'warning',
      completed: 'success',
      cancelled: 'danger',
    }
    const labels: Record<string, string> = {
      confirmed: 'Potvrzeno',
      new: 'Nová',
      completed: 'Dokončeno',
      cancelled: 'Zrušeno',
    }
    return (
      <Badge variant={variants[status] || 'default'} size="sm">
        {labels[status] || status}
      </Badge>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Poslední objednávky</CardTitle>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Žádné objednávky
          </p>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="block p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                      <ShoppingCart className="w-5 h-5 text-partypal-pink-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {order.orderNumber}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {order.customer
                          ? `${order.customer.firstName} ${order.customer.lastName}`
                          : 'Nepřiřazený zákazník'}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(order.status)}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    {formatDate(order.createdAt)}
                  </span>
                  <span className="font-semibold text-gray-900">
                    {(() => {
                      const pricing = order.pricing as { total?: number } | null
                      return (pricing?.total ?? 0).toLocaleString('cs-CZ')
                    })()} Kč
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
