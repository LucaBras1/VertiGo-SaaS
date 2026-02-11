export { cn } from '@vertigo/ui'

export function formatCurrency(amount: number, currency: string = 'CZK'): string {
  return `${amount.toLocaleString('cs-CZ')} ${currency}`
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('cs-CZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleTimeString('cs-CZ', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${minutes}:${String(secs).padStart(2, '0')}`
}

export function formatDurationMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours === 0) return `${mins} min`
  if (mins === 0) return `${hours} h`
  return `${hours} h ${mins} min`
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}
