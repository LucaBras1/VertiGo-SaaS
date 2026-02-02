/**
 * @vertigo/email - Welcome Email Template
 */

import type { EmailBranding, WelcomeEmailData } from '../types'
import { wrapInBaseTemplate, generateButton } from './base'

/**
 * Generate welcome email HTML
 */
export function generateWelcomeEmail(
  branding: EmailBranding,
  data: WelcomeEmailData
): string {
  const { recipientName, loginUrl } = data

  const content = `
    <p style="font-size: 16px;">Hello, <strong>${recipientName}</strong>!</p>
    <p>Your account has been created successfully. You can now start using ${branding.appName}.</p>
    ${generateButton('Sign In', loginUrl, branding.primaryColor)}
    <p style="color: #666; font-size: 14px;">If you have any questions, feel free to contact us.</p>
  `

  return wrapInBaseTemplate(branding, content, { title: `Welcome to ${branding.appName}!` })
}

/**
 * Generate welcome email plain text
 */
export function generateWelcomeEmailText(
  branding: EmailBranding,
  data: WelcomeEmailData
): string {
  const { recipientName, loginUrl } = data
  return `Hello, ${recipientName}! Your account has been created. Sign in at: ${loginUrl}`
}
