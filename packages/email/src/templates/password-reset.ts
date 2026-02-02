/**
 * @vertigo/email - Password Reset Email Template
 */

import type { EmailBranding, PasswordResetEmailData } from '../types'
import { wrapInBaseTemplate, generateButton } from './base'

/**
 * Generate password reset email HTML
 */
export function generatePasswordResetEmail(
  branding: EmailBranding,
  data: PasswordResetEmailData
): string {
  const { recipientName, resetUrl, expiresIn = '1 hour' } = data

  const content = `
    <p style="font-size: 16px;">Hello, <strong>${recipientName}</strong>!</p>
    <p>We received a request to reset your password. Click the button below to set a new password:</p>
    ${generateButton('Set New Password', resetUrl, branding.primaryColor)}
    <p style="color: #666; font-size: 14px;">This link will expire in ${expiresIn}.</p>
    <p style="color: #666; font-size: 14px;">If you didn't request a password reset, you can safely ignore this email.</p>
  `

  return wrapInBaseTemplate(branding, content, { title: 'Password Reset' })
}

/**
 * Generate password reset email plain text
 */
export function generatePasswordResetEmailText(
  branding: EmailBranding,
  data: PasswordResetEmailData
): string {
  const { recipientName, resetUrl, expiresIn = '1 hour' } = data
  return `Hello, ${recipientName}! To reset your password, click here: ${resetUrl} (expires in ${expiresIn})`
}
