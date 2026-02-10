'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/Card'
import { staggerItem, hoverLift } from '@vertigo/ui'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  name: string
  value: string
  change: string
  trend?: 'up' | 'down' | 'neutral'
  icon: LucideIcon
  iconColor: string
  iconBg: string
}

export function StatCard({ name, value, change, trend = 'neutral', icon: Icon, iconColor, iconBg }: StatCardProps) {
  return (
    <motion.div variants={staggerItem} {...hoverLift}>
      <Card className="relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{name}</p>
            <p className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">{value}</p>
            <div className="flex items-center gap-1.5">
              {trend === 'up' && <TrendingUp className="h-3.5 w-3.5 text-success-600" />}
              {trend === 'down' && <TrendingDown className="h-3.5 w-3.5 text-error-500" />}
              {trend === 'neutral' && <Minus className="h-3.5 w-3.5 text-neutral-400" />}
              <p className={`text-sm ${
                trend === 'up' ? 'text-success-600' : trend === 'down' ? 'text-error-500' : 'text-neutral-500 dark:text-neutral-400'
              }`}>
                {change}
              </p>
            </div>
          </div>
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconBg}`}>
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
        </div>
        {/* Subtle gradient accent */}
        <div className="absolute -bottom-8 -right-8 h-24 w-24 rounded-full bg-gradient-to-br from-brand-100/30 to-transparent dark:from-brand-900/20" />
      </Card>
    </motion.div>
  )
}
