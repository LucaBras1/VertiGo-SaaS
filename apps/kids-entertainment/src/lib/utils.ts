/**
 * Utility functions for PartyPal
 */

export { cn } from '@vertigo/ui'

/**
 * Format price in CZK
 */
export function formatPrice(cents: number): string {
  const koruna = cents / 100
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(koruna)
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('cs-CZ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d)
}

/**
 * Format date with time
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('cs-CZ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

/**
 * Generate slug from title
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/**
 * Get age group label
 */
export function getAgeGroupLabel(ageGroup: string): string {
  const labels: Record<string, string> = {
    TODDLER_3_5: '3-5 let',
    KIDS_6_9: '6-9 let',
    TWEENS_10_12: '10-12 let',
    TEENS_13_PLUS: '13+ let',
  }
  return labels[ageGroup] || ageGroup
}

/**
 * Get safety rating badge color
 */
export function getSafetyRatingColor(rating: string): string {
  const colors: Record<string, string> = {
    VERY_SAFE: 'bg-green-100 text-green-800',
    SAFE: 'bg-blue-100 text-blue-800',
    REQUIRES_SUPERVISION: 'bg-yellow-100 text-yellow-800',
    ADULT_ONLY: 'bg-red-100 text-red-800',
  }
  return colors[rating] || 'bg-gray-100 text-gray-800'
}

/**
 * Get energy level icon
 */
export function getEnergyLevelEmoji(level: string): string {
  const emojis: Record<string, string> = {
    CALM: '😌',
    MODERATE: '😊',
    HIGH: '😄',
    VERY_HIGH: '🤩',
  }
  return emojis[level] || '😊'
}

/**
 * Calculate party end time
 */
export function calculateEndTime(startTime: Date, durationMinutes: number): Date {
  return new Date(startTime.getTime() + durationMinutes * 60 * 1000)
}

/**
 * Check if date is in past
 */
export function isPastDate(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date
  return d < new Date()
}

/**
 * Get days until date
 */
export function getDaysUntil(date: Date | string): number {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diff = d.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

/**
 * Truncate text
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}
