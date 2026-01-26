'use client'

interface PaymentStatusBadgeProps {
  status: 'unpaid' | 'partial' | 'paid'
  className?: string
}

export function PaymentStatusBadge({ status, className = '' }: PaymentStatusBadgeProps) {
  const statusConfig = {
    unpaid: {
      label: 'Nezaplaceno',
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
    },
    partial: {
      label: 'Částečně',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
    },
    paid: {
      label: 'Zaplaceno',
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
    },
  }

  const config = statusConfig[status] || statusConfig.unpaid

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor} ${className}`}
    >
      {config.label}
    </span>
  )
}
