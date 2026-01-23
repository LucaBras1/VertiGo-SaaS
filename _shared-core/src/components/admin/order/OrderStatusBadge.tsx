'use client'

import { ORDER_STATUSES, OrderStatus } from '@/lib/order-workflow'

interface OrderStatusBadgeProps {
  status: string
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
}

export function OrderStatusBadge({ status, size = 'md', showIcon = true }: OrderStatusBadgeProps) {
  const config = ORDER_STATUSES[status as OrderStatus] || ORDER_STATUSES.new

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full ${config.bgColor} ${config.color} ${config.borderColor} border ${sizeClasses[size]}`}
    >
      {showIcon && <span>{config.icon}</span>}
      {config.label}
    </span>
  )
}
