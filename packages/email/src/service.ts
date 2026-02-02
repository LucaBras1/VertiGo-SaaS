/**
 * @vertigo/email - Email Service Factory
 * Main entry point for creating email service instances
 */

import { getResendClient } from './client'
import type {
  EmailBranding,
  EmailServiceConfig,
  EmailResult,
  SendEmailOptions,
  WelcomeEmailData,
  PasswordResetEmailData,
  InvoiceEmailData,
  ReminderEmailData,
  EmailAttachment,
} from './types'
import {
  generateWelcomeEmail,
  generateWelcomeEmailText,
  generatePasswordResetEmail,
  generatePasswordResetEmailText,
  generateInvoiceEmail,
  generateInvoiceEmailText,
  generateReminderEmail,
  generateReminderEmailText,
} from './templates/index'

/**
 * Email service interface
 */
export interface EmailService {
  /** Send a raw email */
  sendEmail(options: SendEmailOptions): Promise<EmailResult>

  /** Send welcome email */
  sendWelcome(options: { to: string; data: WelcomeEmailData }): Promise<EmailResult>

  /** Send password reset email */
  sendPasswordReset(options: { to: string; data: PasswordResetEmailData }): Promise<EmailResult>

  /** Send invoice email */
  sendInvoice(options: { to: string; data: InvoiceEmailData }): Promise<EmailResult>

  /** Send reminder email */
  sendReminder(options: { to: string; data: ReminderEmailData }): Promise<EmailResult>

  /** Send custom templated email */
  sendCustom(options: {
    to: string | string[]
    subject: string
    html: string
    text?: string
    attachments?: EmailAttachment[]
  }): Promise<EmailResult>
}

/**
 * Create an email service instance with branding
 *
 * @example
 * import { createEmailService, verticalThemes } from '@vertigo/email'
 *
 * const emailService = createEmailService({
 *   branding: verticalThemes.fitness,
 * })
 *
 * await emailService.sendWelcome({
 *   to: 'user@example.com',
 *   data: { recipientName: 'John', loginUrl: 'https://...' }
 * })
 */
export function createEmailService(config: EmailServiceConfig): EmailService {
  const { branding, fromEmail } = config
  const from = fromEmail || branding.fromEmail

  /**
   * Core send email function
   */
  async function sendEmail(options: SendEmailOptions): Promise<EmailResult> {
    const resend = getResendClient()

    if (!resend) {
      console.warn('[Email] Resend not configured - email not sent:', { to: options.to, subject: options.subject })
      return { success: false, error: 'Email service not configured' }
    }

    try {
      const { data, error } = await resend.emails.send({
        from,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: options.html,
        text: options.text,
        attachments: options.attachments?.map((a) => ({
          filename: a.filename,
          content: a.content,
          contentType: a.contentType,
        })),
      })

      if (error) {
        console.error('[Email] Resend error:', error)
        return { success: false, error: error.message }
      }

      return { success: true, messageId: data?.id }
    } catch (err) {
      console.error('[Email] Send error:', err)
      return { success: false, error: 'Failed to send email' }
    }
  }

  return {
    sendEmail,

    async sendWelcome({ to, data }) {
      return sendEmail({
        to,
        subject: `Welcome to ${branding.appName}!`,
        html: generateWelcomeEmail(branding, data),
        text: generateWelcomeEmailText(branding, data),
      })
    },

    async sendPasswordReset({ to, data }) {
      return sendEmail({
        to,
        subject: `Password Reset - ${branding.appName}`,
        html: generatePasswordResetEmail(branding, data),
        text: generatePasswordResetEmailText(branding, data),
      })
    },

    async sendInvoice({ to, data }) {
      return sendEmail({
        to,
        subject: `Invoice ${data.invoiceNumber} - ${branding.appName}`,
        html: generateInvoiceEmail(branding, data),
        text: generateInvoiceEmailText(branding, data),
      })
    },

    async sendReminder({ to, data }) {
      return sendEmail({
        to,
        subject: `Reminder: ${data.eventName} - ${data.eventDate}`,
        html: generateReminderEmail(branding, data),
        text: generateReminderEmailText(branding, data),
      })
    },

    async sendCustom(options) {
      return sendEmail(options)
    },
  }
}
