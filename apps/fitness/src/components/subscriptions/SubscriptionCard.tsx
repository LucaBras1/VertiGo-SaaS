'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { cs } from 'date-fns/locale'
import {
  RefreshCw,
  Pause,
  Play,
  X,
  MoreVertical,
  CreditCard,
  Calendar,
  AlertTriangle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SubscriptionCardProps {
  subscription: {
    id: string
    status: string
    amount: number | { toString: () => string }
    currency: string
    frequency: string
    nextBillingDate: string
    startDate: string
    endDate?: string | null
    pausedAt?: string | null
    autoRenew: boolean
    retryCount: number
    client: {
      id: string
      name: string
      email: string
    }
    package?: {
      id: string
      name: string
      credits: number
    } | null
    _count?: {
      generatedInvoices: number
    }
  }
  onPause?: (id: string) => void
  onResume?: (id: string) => void
  onCancel?: (id: string) => void
  onRetry?: (id: string) => void
  onClick?: (id: string) => void
}

const frequencyLabels: Record<string, string> = {
  WEEKLY: 'Tydenni',
  BIWEEKLY: 'Dvoutydne',
  MONTHLY: 'Mesicni',
  QUARTERLY: 'Ctvrtletni',
  YEARLY: 'Rocni',
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  active: { label: 'Aktivni', color: 'text-green-400', bg: 'bg-green-500/20' },
  paused: { label: 'Pozastaveno', color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  cancelled: { label: 'Zruseno', color: 'text-red-400', bg: 'bg-red-500/20' },
  expired: { label: 'Vyprselo', color: 'text-gray-400', bg: 'bg-gray-500/20' },
  past_due: { label: 'Po splatnosti', color: 'text-orange-400', bg: 'bg-orange-500/20' },
}

export function SubscriptionCard({
  subscription,
  onPause,
  onResume,
  onCancel,
  onRetry,
  onClick,
}: SubscriptionCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const status = statusConfig[subscription.status] || statusConfig.active

  const amount = typeof subscription.amount === 'number'
    ? subscription.amount
    : parseFloat(subscription.amount.toString())

  return (
    <div
      className={cn(
        'bg-secondary-800 rounded-xl border border-secondary-700 p-4 transition-all',
        onClick && 'cursor-pointer hover:border-secondary-600'
      )}
      onClick={() => onClick?.(subscription.id)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-white">
            {subscription.client.name}
          </h3>
          <p className="text-sm text-gray-400">{subscription.client.email}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn('px-2 py-1 text-xs rounded-full', status.bg, status.color)}>
            {status.label}
          </span>
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowMenu(!showMenu)
              }}
              className="p-1 rounded-md hover:bg-secondary-700 text-gray-400"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-8 z-10 bg-secondary-700 rounded-lg shadow-lg border border-secondary-600 py-1 min-w-[140px]">
                {subscription.status === 'active' && onPause && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onPause(subscription.id)
                      setShowMenu(false)
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-200 hover:bg-secondary-600 flex items-center gap-2"
                  >
                    <Pause className="h-4 w-4" />
                    Pozastavit
                  </button>
                )}
                {subscription.status === 'paused' && onResume && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onResume(subscription.id)
                      setShowMenu(false)
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-200 hover:bg-secondary-600 flex items-center gap-2"
                  >
                    <Play className="h-4 w-4" />
                    Obnovit
                  </button>
                )}
                {subscription.status === 'past_due' && onRetry && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onRetry(subscription.id)
                      setShowMenu(false)
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-200 hover:bg-secondary-600 flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Opakovat platbu
                  </button>
                )}
                {['active', 'paused'].includes(subscription.status) && onCancel && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onCancel(subscription.id)
                      setShowMenu(false)
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-secondary-600 flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Zrusit
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Package */}
      {subscription.package && (
        <div className="mb-3">
          <span className="px-2 py-1 text-xs bg-primary-500/20 text-primary-400 rounded">
            {subscription.package.name} ({subscription.package.credits} kreditu)
          </span>
        </div>
      )}

      {/* Amount & Frequency */}
      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-2xl font-bold text-white">
          {amount.toLocaleString('cs-CZ')} {subscription.currency}
        </span>
        <span className="text-sm text-gray-400">
          / {frequencyLabels[subscription.frequency] || subscription.frequency}
        </span>
      </div>

      {/* Details */}
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between text-gray-400">
          <span className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Dalsi platba
          </span>
          <span className="text-white">
            {subscription.status === 'active'
              ? format(new Date(subscription.nextBillingDate), 'd. MMMM yyyy', { locale: cs })
              : '-'}
          </span>
        </div>

        <div className="flex items-center justify-between text-gray-400">
          <span className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Auto-obnoveni
          </span>
          <span className={subscription.autoRenew ? 'text-green-400' : 'text-gray-500'}>
            {subscription.autoRenew ? 'Ano' : 'Ne'}
          </span>
        </div>

        {subscription._count && (
          <div className="flex items-center justify-between text-gray-400">
            <span>Vygenerovano faktur</span>
            <span className="text-white">{subscription._count.generatedInvoices}</span>
          </div>
        )}

        {subscription.retryCount > 0 && (
          <div className="flex items-center gap-2 text-orange-400 mt-2">
            <AlertTriangle className="h-4 w-4" />
            <span>Pokus o platbu: {subscription.retryCount}/3</span>
          </div>
        )}
      </div>
    </div>
  )
}
