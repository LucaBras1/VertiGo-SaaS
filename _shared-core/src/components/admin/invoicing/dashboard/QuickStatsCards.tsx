'use client'

/**
 * Quick Stats Cards Component
 *
 * Displays key invoicing statistics in card format
 */

import { FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { DashboardStats, formatAmount } from '@/types/invoicing'

interface QuickStatsCardsProps {
  stats: DashboardStats
  loading?: boolean
}

export function QuickStatsCards({ stats, loading }: QuickStatsCardsProps) {
  const cards = [
    {
      title: 'Celkem fakturováno',
      value: formatAmount(stats.totalInvoiced),
      count: `${stats.invoiceCount} dokladů`,
      icon: FileText,
      color: 'blue',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
      borderColor: 'border-blue-200 dark:border-blue-800',
    },
    {
      title: 'Uhrazeno',
      value: formatAmount(stats.totalPaid),
      count: `${stats.paidCount} dokladů`,
      icon: CheckCircle,
      color: 'green',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      iconColor: 'text-green-600 dark:text-green-400',
      borderColor: 'border-green-200 dark:border-green-800',
    },
    {
      title: 'Neuhrazeno',
      value: formatAmount(stats.totalUnpaid),
      count: `${stats.unpaidCount} dokladů`,
      icon: Clock,
      color: 'yellow',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
    },
    {
      title: 'Po splatnosti',
      value: formatAmount(stats.totalOverdue),
      count: `${stats.overdueCount} dokladů`,
      icon: AlertCircle,
      color: 'red',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      iconColor: 'text-red-600 dark:text-red-400',
      borderColor: 'border-red-200 dark:border-red-800',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon

        return (
          <div
            key={card.title}
            className={`${card.bgColor} ${card.borderColor} border rounded-lg p-4 transition-all ${
              loading ? 'animate-pulse' : ''
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  {card.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {loading ? '...' : card.value}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {loading ? '...' : card.count}
                </p>
              </div>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <Icon className={`w-6 h-6 ${card.iconColor}`} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
