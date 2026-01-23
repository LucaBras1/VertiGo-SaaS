'use client'

/**
 * Customer Order History Component
 *
 * Displays a collapsible list of previous orders for a customer.
 * Used in OrderForm to help with creating new orders based on history.
 */

import { useState, useEffect } from 'react'
import { ChevronDown, ChevronRight, ShoppingCart, Calendar, Package, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface OrderHistoryItem {
  _id: string
  orderNumber?: string
  eventName?: string
  dates: string[]
  status: string
  items?: {
    type: string
    performance?: { title: string }
    game?: { title: string }
    service?: { title: string }
    price: number
  }[]
  pricing?: {
    totalPrice?: number
  }
  venue?: {
    city?: string
  }
}

interface CustomerOrderHistoryProps {
  customerId: string
  collapsed?: boolean
}

const statusLabels: Record<string, string> = {
  new: 'Nova',
  reviewing: 'V posouzeni',
  awaiting_info: 'Ceka na info',
  quote_sent: 'Nabidka odeslana',
  confirmed: 'Potvrzena',
  approved: 'Schvalena',
  completed: 'Dokoncena',
  cancelled: 'Zrusena',
}

const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800',
  reviewing: 'bg-yellow-100 text-yellow-800',
  awaiting_info: 'bg-purple-100 text-purple-800',
  quote_sent: 'bg-indigo-100 text-indigo-800',
  confirmed: 'bg-green-100 text-green-800',
  approved: 'bg-emerald-100 text-emerald-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
}

export function CustomerOrderHistory({ customerId, collapsed = true }: CustomerOrderHistoryProps) {
  const [isOpen, setIsOpen] = useState(!collapsed)
  const [orders, setOrders] = useState<OrderHistoryItem[]>([])
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)

  // Load orders when expanded or when customerId changes
  useEffect(() => {
    if (!customerId) {
      setOrders([])
      setLoaded(false)
      return
    }

    // Load immediately if customerId provided
    const fetchOrders = async () => {
      setLoading(true)
      try {
        const response = await fetch(
          `/api/admin/orders?customerId=${customerId}&populate=true&pageSize=10&sort=createdAt&order=desc`
        )

        if (response.ok) {
          const data = await response.json()
          setOrders(data.orders || [])
        }
      } catch (error) {
        console.error('Error fetching customer orders:', error)
      } finally {
        setLoading(false)
        setLoaded(true)
      }
    }

    fetchOrders()
  }, [customerId])

  // Get item titles from order
  const getItemTitles = (items?: OrderHistoryItem['items']) => {
    if (!items || items.length === 0) return '-'

    return items
      .map((item) => {
        if (item.performance?.title) return item.performance.title
        if (item.game?.title) return item.game.title
        if (item.service?.title) return item.service.title
        return null
      })
      .filter(Boolean)
      .join(', ')
  }

  // Don't render if no customer selected
  if (!customerId) {
    return null
  }

  return (
    <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden">
      {/* Header - always visible */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between text-left transition-colors"
      >
        <div className="flex items-center gap-2">
          {isOpen ? (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-500" />
          )}
          <ShoppingCart className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">
            Historie objednavek
          </span>
          {loaded && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-700">
              {orders.length}
            </span>
          )}
        </div>
        {loading && (
          <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        )}
      </button>

      {/* Content - collapsible */}
      {isOpen && (
        <div className="border-t border-gray-200">
          {loading && !loaded ? (
            <div className="px-4 py-6 text-center text-sm text-gray-500">
              Nacitani historie...
            </div>
          ) : orders.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-gray-500">
              Zakaznik zatim nema zadne objednavky
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Order header */}
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900 text-sm">
                          {order.eventName || `Objednavka ${order.orderNumber || ''}`}
                        </span>
                        <span className={`inline-flex px-1.5 py-0.5 text-xs font-medium rounded ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                          {statusLabels[order.status] || order.status}
                        </span>
                      </div>

                      {/* Date and location */}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {order.dates && order.dates.length > 0
                            ? new Date(order.dates[0]).toLocaleDateString('cs-CZ')
                            : '-'}
                        </span>
                        {order.venue?.city && (
                          <span>{order.venue.city}</span>
                        )}
                      </div>

                      {/* Items */}
                      <div className="flex items-center gap-1 mt-1 text-xs text-gray-600">
                        <Package className="h-3 w-3 text-gray-400" />
                        <span className="truncate">{getItemTitles(order.items)}</span>
                      </div>
                    </div>

                    {/* Price and link */}
                    <div className="flex flex-col items-end gap-1">
                      <span className="font-semibold text-gray-900 text-sm">
                        {order.pricing?.totalPrice
                          ? `${order.pricing.totalPrice.toLocaleString('cs-CZ')} Kc`
                          : '-'}
                      </span>
                      <Link
                        href={`/admin/orders/${order._id}`}
                        target="_blank"
                        className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-0.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Detail <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}

              {/* Show more link */}
              {orders.length >= 10 && (
                <div className="px-4 py-2 bg-gray-50 text-center">
                  <Link
                    href={`/admin/orders?customerId=${customerId}`}
                    target="_blank"
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Zobrazit vsechny objednavky &rarr;
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
