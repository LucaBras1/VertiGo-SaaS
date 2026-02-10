'use client'

import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card, staggerItem } from '@vertigo/ui'

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  change?: number
  icon: LucideIcon
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'emerald'
  format?: 'number' | 'currency' | 'percent'
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    icon: 'text-blue-600 dark:text-blue-400',
  },
  green: {
    bg: 'bg-green-50 dark:bg-green-950/40',
    icon: 'text-green-600 dark:text-green-400',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-950/40',
    icon: 'text-purple-600 dark:text-purple-400',
  },
  orange: {
    bg: 'bg-orange-50 dark:bg-orange-950/40',
    icon: 'text-orange-600 dark:text-orange-400',
  },
  red: {
    bg: 'bg-red-50 dark:bg-red-950/40',
    icon: 'text-red-600 dark:text-red-400',
  },
  emerald: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    icon: 'text-emerald-600 dark:text-emerald-400',
  },
}

export function MetricCard({ title, value, subtitle, change, icon: Icon, color, format = 'number' }: MetricCardProps) {
  const colors = colorClasses[color]

  const formatValue = (val: string | number): string => {
    if (typeof val === 'string') return val
    if (format === 'currency') {
      return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 }).format(
        val / 100
      )
    }
    if (format === 'percent') {
      return `${val.toFixed(1)}%`
    }
    return new Intl.NumberFormat('cs-CZ').format(val)
  }

  return (
    <motion.div variants={staggerItem}>
      <Card hover={false} animated={false} className="p-6">
        <div className="flex items-center justify-between">
          <div className={`p-3 rounded-lg ${colors.bg}`}>
            <Icon className={`h-6 w-6 ${colors.icon}`} />
          </div>
          {change !== undefined && (
            <div
              className={`flex items-center gap-1 text-sm font-medium ${
                change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}
            >
              {change >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              {Math.abs(change).toFixed(1)}%
            </div>
          )}
        </div>
        <div className="mt-4">
          <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{title}</h3>
          <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-neutral-50">{formatValue(value)}</p>
          {subtitle && <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{subtitle}</p>}
        </div>
      </Card>
    </motion.div>
  )
}
