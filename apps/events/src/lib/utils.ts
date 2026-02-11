export { cn } from '@vertigo/ui'

/**
 * Format currency
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

/**
 * Format date
 */
export function formatDate(date: Date | string, format: 'short' | 'long' = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date

  if (format === 'long') {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(d)
  }

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d)
}

/**
 * Format time
 */
export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':')
  const h = parseInt(hours, 10)
  const period = h >= 12 ? 'PM' : 'AM'
  const displayHours = h > 12 ? h - 12 : h === 0 ? 12 : h
  return `${displayHours}:${minutes} ${period}`
}

/**
 * Calculate duration between two times
 */
export function calculateDuration(startTime: string, endTime: string): string {
  const [startHours, startMinutes] = startTime.split(':').map(Number)
  const [endHours, endMinutes] = endTime.split(':').map(Number)

  let minutes = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes)

  if (minutes < 0) {
    minutes += 24 * 60 // Add 24 hours if end time is on next day
  }

  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (hours === 0) return `${mins}m`
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}m`
}

/**
 * Truncate text
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

/**
 * Generate initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Sleep utility for demos
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
