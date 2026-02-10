import { cn } from '../utils'

type StatusType =
  | 'active' | 'inactive' | 'draft'
  | 'confirmed' | 'tentative' | 'cancelled' | 'completed'
  | 'paid' | 'unpaid' | 'overdue' | 'sent' | 'pending'

const statusStyles: Record<StatusType, string> = {
  active: 'bg-success-50 text-success-700 ring-success-600/20 dark:bg-success-950/50 dark:text-success-400',
  inactive: 'bg-neutral-100 text-neutral-600 ring-neutral-500/20 dark:bg-neutral-800 dark:text-neutral-400',
  draft: 'bg-neutral-100 text-neutral-600 ring-neutral-500/20 dark:bg-neutral-800 dark:text-neutral-400',
  confirmed: 'bg-success-50 text-success-700 ring-success-600/20 dark:bg-success-950/50 dark:text-success-400',
  tentative: 'bg-warning-50 text-warning-700 ring-warning-600/20 dark:bg-warning-950/50 dark:text-warning-400',
  cancelled: 'bg-error-50 text-error-700 ring-error-600/20 dark:bg-error-950/50 dark:text-error-400',
  completed: 'bg-info-50 text-info-700 ring-info-600/20 dark:bg-info-950/50 dark:text-info-400',
  paid: 'bg-success-50 text-success-700 ring-success-600/20 dark:bg-success-950/50 dark:text-success-400',
  unpaid: 'bg-warning-50 text-warning-700 ring-warning-600/20 dark:bg-warning-950/50 dark:text-warning-400',
  overdue: 'bg-error-50 text-error-700 ring-error-600/20 dark:bg-error-950/50 dark:text-error-400',
  sent: 'bg-info-50 text-info-700 ring-info-600/20 dark:bg-info-950/50 dark:text-info-400',
  pending: 'bg-warning-50 text-warning-700 ring-warning-600/20 dark:bg-warning-950/50 dark:text-warning-400',
}

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const style = statusStyles[status as StatusType] || statusStyles.draft
  const label = status.charAt(0).toUpperCase() + status.slice(1)

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
        style,
        className
      )}
    >
      {label}
    </span>
  )
}
