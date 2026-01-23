/**
 * Utility functions for TeamForge
 */

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format currency (CZK by default)
 */
export function formatCurrency(amount: number, currency: string = 'CZK'): string {
  const amountInCurrency = amount / 100 // Convert hellers to currency
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency,
  }).format(amountInCurrency)
}

/**
 * Format date
 */
export function formatDate(date: Date | string, format: 'short' | 'long' = 'short'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date

  if (format === 'long') {
    return new Intl.DateTimeFormat('cs-CZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(dateObj)
  }

  return new Intl.DateTimeFormat('cs-CZ', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).format(dateObj)
}

/**
 * Generate slug from title
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD') // Remove accents
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, '') // Trim - from end of text
}

/**
 * Truncate text
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

/**
 * Get objective label (friendly name)
 */
export function getObjectiveLabel(objective: string): string {
  const labels: Record<string, string> = {
    COMMUNICATION: 'Communication',
    TRUST: 'Trust Building',
    LEADERSHIP: 'Leadership Development',
    PROBLEM_SOLVING: 'Problem Solving',
    CREATIVITY: 'Creative Thinking',
    COLLABORATION: 'Team Collaboration',
    CONFLICT: 'Conflict Resolution',
    MOTIVATION: 'Team Motivation',
  }
  return labels[objective] || objective
}

/**
 * Get physical level label
 */
export function getPhysicalLevelLabel(level: string): string {
  const labels: Record<string, string> = {
    LOW: 'Low Physical Demand',
    MEDIUM: 'Medium Physical Demand',
    HIGH: 'High Physical Demand',
  }
  return labels[level] || level
}

/**
 * Get industry type label
 */
export function getIndustryLabel(industry: string): string {
  const labels: Record<string, string> = {
    TECHNOLOGY: 'Technology',
    FINANCE: 'Finance',
    HEALTHCARE: 'Healthcare',
    EDUCATION: 'Education',
    MANUFACTURING: 'Manufacturing',
    RETAIL: 'Retail',
    HOSPITALITY: 'Hospitality',
    CONSULTING: 'Consulting',
    GOVERNMENT: 'Government',
    NONPROFIT: 'Non-Profit',
    OTHER: 'Other',
  }
  return labels[industry] || industry
}

/**
 * Format duration (minutes to human-readable)
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`
  }
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (mins === 0) {
    return `${hours}h`
  }
  return `${hours}h ${mins}min`
}

/**
 * Calculate total duration from activities
 */
export function calculateTotalDuration(activities: Array<{ duration: number }>): number {
  return activities.reduce((total, activity) => total + activity.duration, 0)
}
