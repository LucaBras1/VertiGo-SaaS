'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, Loader2 } from 'lucide-react'
import {
  ORDER_STATUSES,
  OrderStatus,
  getNextStatuses,
  getStatusProgress,
  STATUS_WORKFLOW_ORDER,
} from '@/lib/order-workflow'
import { OrderStatusBadge } from './OrderStatusBadge'

interface OrderStatusChangerProps {
  orderId: string
  currentStatus: string
  orderNumber: string
}

export function OrderStatusChanger({
  orderId,
  currentStatus,
  orderNumber,
}: OrderStatusChangerProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const status = currentStatus as OrderStatus
  const nextStatuses = getNextStatuses(status)
  const progress = getStatusProgress(status)

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (loading) return

    setError(null)
    setLoading(newStatus)

    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Nepodazilo se zmenit stav')
      }

      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nepodazilo se zmenit stav')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Stav objednavky</h3>

      {/* Current status */}
      <div className="mb-6">
        <div className="text-sm text-gray-500 mb-2">Aktualni stav</div>
        <OrderStatusBadge status={status} size="lg" />
        <p className="mt-2 text-sm text-gray-600">
          {ORDER_STATUSES[status].description}
        </p>
      </div>

      {/* Progress bar */}
      {status !== 'cancelled' && (
        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Prubeh</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Progress steps */}
          <div className="flex justify-between mt-2">
            {STATUS_WORKFLOW_ORDER.map((s, index) => {
              const isActive = STATUS_WORKFLOW_ORDER.indexOf(status) >= index
              const isCurrent = s === status
              return (
                <div
                  key={s}
                  className={`flex flex-col items-center ${
                    index === 0 ? '' : 'flex-1'
                  }`}
                >
                  <div
                    className={`w-3 h-3 rounded-full ${
                      isActive
                        ? isCurrent
                          ? 'bg-primary ring-2 ring-primary ring-offset-2'
                          : 'bg-primary'
                        : 'bg-gray-300'
                    }`}
                  />
                  <span
                    className={`text-xs mt-1 ${
                      isCurrent ? 'font-semibold text-gray-900' : 'text-gray-400'
                    }`}
                  >
                    {ORDER_STATUSES[s].icon}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Status change buttons */}
      {nextStatuses.length > 0 && (
        <div>
          <div className="text-sm text-gray-500 mb-2">Zmenit stav na</div>
          <div className="flex flex-wrap gap-2">
            {nextStatuses.map((nextStatus) => {
              const config = ORDER_STATUSES[nextStatus]
              const isLoading = loading === nextStatus

              return (
                <button
                  key={nextStatus}
                  onClick={() => handleStatusChange(nextStatus)}
                  disabled={loading !== null}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${config.bgColor} ${config.color} hover:opacity-80 border ${config.borderColor}`}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>{config.icon}</span>
                  )}
                  {config.label}
                  <ChevronRight className="w-4 h-4" />
                </button>
              )
            })}
          </div>
        </div>
      )}

      {nextStatuses.length === 0 && (
        <div className="text-sm text-gray-500 italic">
          Toto je konecny stav objednavky.
        </div>
      )}
    </div>
  )
}
