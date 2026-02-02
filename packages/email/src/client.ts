/**
 * @vertigo/email - Resend Client
 * Lazy-loaded Resend client to avoid build-time errors
 */

import { Resend } from 'resend'

let _resend: Resend | null = null

/**
 * Get or create Resend client instance
 * Returns null if RESEND_API_KEY is not set
 */
export function getResendClient(): Resend | null {
  if (_resend === null && process.env.RESEND_API_KEY) {
    _resend = new Resend(process.env.RESEND_API_KEY)
  }
  return _resend
}

/**
 * Check if email service is configured
 */
export function isEmailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY
}
