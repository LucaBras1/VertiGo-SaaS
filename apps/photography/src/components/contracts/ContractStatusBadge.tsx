'use client'

import type { ContractStatus } from '@/generated/prisma'
import { Badge } from '@vertigo/ui'

interface ContractStatusBadgeProps {
  status: ContractStatus
  size?: 'sm' | 'md'
}

const statusConfig: Record<ContractStatus, { label: string; variant: 'default' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' }> = {
  DRAFT: { label: 'Draft', variant: 'secondary' },
  SENT: { label: 'Sent', variant: 'info' },
  VIEWED: { label: 'Viewed', variant: 'warning' },
  SIGNED: { label: 'Signed', variant: 'success' },
  CANCELLED: { label: 'Cancelled', variant: 'danger' },
  EXPIRED: { label: 'Expired', variant: 'default' },
}

export function ContractStatusBadge({ status, size = 'md' }: ContractStatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <Badge variant={config.variant} size={size}>
      {config.label}
    </Badge>
  )
}
