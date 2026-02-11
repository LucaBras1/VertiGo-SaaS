export { cn } from '@vertigo/ui'

import { format, formatDistanceToNow, parseISO } from 'date-fns'

/**
 * Format a date for display
 */
export function formatDate(date: Date | string, formatString: string = 'PP'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, formatString)
}

/**
 * Format a date as relative time (e.g., "2 days ago")
 */
export function formatRelativeDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return formatDistanceToNow(dateObj, { addSuffix: true })
}

/**
 * Format time for display (e.g., "7:30 PM")
 */
export function formatTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, 'h:mm a')
}

/**
 * Format duration in minutes to readable format
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (hours === 0) {
    return `${mins}min`
  } else if (mins === 0) {
    return `${hours}h`
  } else {
    return `${hours}h ${mins}min`
  }
}

/**
 * Generate initials from a name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')
}

/**
 * Capitalize first letter of each word
 */
export function titleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Format enum value to readable string
 */
export function formatEnumValue(value: string): string {
  return value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

/**
 * Truncate text with ellipsis
 */
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

/**
 * Generate a slug from a string
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Format currency
 */
export function formatCurrency(amount: number, currency: string = 'CZK'): string {
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency,
  }).format(amount)
}

/**
 * Get production status color
 */
export function getProductionStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PLANNING: 'bg-gray-100 text-gray-800',
    PRE_PRODUCTION: 'bg-blue-100 text-blue-800',
    REHEARSING: 'bg-yellow-100 text-yellow-800',
    TECH_WEEK: 'bg-orange-100 text-orange-800',
    RUNNING: 'bg-green-100 text-green-800',
    CLOSED: 'bg-red-100 text-red-800',
    ARCHIVED: 'bg-gray-100 text-gray-600',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

/**
 * Get rehearsal type icon/label
 */
export function getRehearsalTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    READ_THROUGH: 'Read-Through',
    BLOCKING: 'Blocking',
    SCENE_WORK: 'Scene Work',
    RUN_THROUGH: 'Run-Through',
    TECH: 'Tech Rehearsal',
    DRESS: 'Dress Rehearsal',
    PREVIEW: 'Preview',
    NOTES: 'Notes Session',
    OTHER: 'Other',
  }
  return labels[type] || type
}
