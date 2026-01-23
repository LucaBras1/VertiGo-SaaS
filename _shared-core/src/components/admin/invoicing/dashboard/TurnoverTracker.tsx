'use client'

/**
 * Turnover Tracker Component
 *
 * Displays VAT turnover limit tracking for non-VAT payers
 */

import { TrendingUp, AlertTriangle } from 'lucide-react'
import { TurnoverData, formatAmount } from '@/types/invoicing'

interface TurnoverTrackerProps {
  data: TurnoverData
}

export function TurnoverTracker({ data }: TurnoverTrackerProps) {
  const progressColor = data.isWarning
    ? 'bg-orange-500'
    : data.percentage >= 100
      ? 'bg-red-500'
      : 'bg-green-500'

  const textColor = data.isWarning
    ? 'text-orange-600 dark:text-orange-400'
    : data.percentage >= 100
      ? 'text-red-600 dark:text-red-400'
      : 'text-green-600 dark:text-green-400'

  return (
    <div className={`p-4 rounded-lg border ${
      data.isWarning
        ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
        : data.percentage >= 100
          ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
          : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {data.isWarning ? (
            <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          ) : (
            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
          )}
          <span className="font-medium text-gray-900 dark:text-white">
            Hlídání obratu {data.year}
          </span>
        </div>
        <span className={`text-sm font-medium ${textColor}`}>
          {data.percentage}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-2">
        <div
          className={`h-2.5 rounded-full ${progressColor} transition-all duration-300`}
          style={{ width: `${Math.min(100, data.percentage)}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500 dark:text-gray-400">
          {formatAmount(data.currentTurnover)} / {formatAmount(data.limit)}
        </span>
        <span className={`font-medium ${textColor}`}>
          Zbývá {formatAmount(data.remaining)}
        </span>
      </div>

      {data.percentage >= 100 && (
        <div className="mt-2 text-sm text-red-600 dark:text-red-400">
          ⚠️ Překročen limit pro neplátce DPH!
        </div>
      )}

      {data.isWarning && data.percentage < 100 && (
        <div className="mt-2 text-sm text-orange-600 dark:text-orange-400">
          ⚠️ Blížíte se limitu pro neplátce DPH
        </div>
      )}
    </div>
  )
}
