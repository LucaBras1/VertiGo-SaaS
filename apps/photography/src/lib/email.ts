/**
 * Email Service - ShootFlow
 * Email notifications for photography business
 * Using @vertigo/email shared package
 */

import {
  createEmailService,
  photographyTheme,
  generateButton,
  generateInfoBox,
  wrapInBaseTemplate,
  type EmailResult,
} from '@vertigo/email'

// Create email service with photography branding
const emailService = createEmailService({
  branding: photographyTheme,
})

// Re-export for convenience
export type { EmailResult }

// Standard email templates
export async function sendWelcomeEmail({
  to,
  name,
  loginUrl,
}: {
  to: string
  name: string
  loginUrl: string
}): Promise<EmailResult> {
  return emailService.sendWelcome({
    to,
    data: { recipientName: name, loginUrl },
  })
}

export async function sendPasswordResetEmail({
  to,
  name,
  resetUrl,
  expiresIn = '1 hour',
}: {
  to: string
  name: string
  resetUrl: string
  expiresIn?: string
}): Promise<EmailResult> {
  return emailService.sendPasswordReset({
    to,
    data: { recipientName: name, resetUrl, expiresIn },
  })
}

export async function sendInvoiceEmail({
  to,
  clientName,
  invoiceNumber,
  amount,
  dueDate,
  invoiceUrl,
}: {
  to: string
  clientName: string
  invoiceNumber: string
  amount: string
  dueDate: string
  invoiceUrl: string
}): Promise<EmailResult> {
  return emailService.sendInvoice({
    to,
    data: { recipientName: clientName, invoiceNumber, amount, dueDate, invoiceUrl },
  })
}

// Custom photography-specific templates

export async function sendShootReminderEmail({
  to,
  clientName,
  shootDate,
  shootTime,
  location,
  photographerName,
}: {
  to: string
  clientName: string
  shootDate: string
  shootTime: string
  location?: string
  photographerName: string
}): Promise<EmailResult> {
  const shootDetails = `
    <p style="margin: 5px 0;"><strong>Date:</strong> ${shootDate}</p>
    <p style="margin: 5px 0;"><strong>Time:</strong> ${shootTime}</p>
    <p style="margin: 5px 0;"><strong>Photographer:</strong> ${photographerName}</p>
    ${location ? `<p style="margin: 5px 0;"><strong>Location:</strong> ${location}</p>` : ''}
  `

  const content = `
    <p style="font-size: 16px;">Hello, <strong>${clientName}</strong>!</p>
    <p>This is a reminder about your upcoming photo shoot:</p>
    ${generateInfoBox(shootDetails, photographyTheme.primaryColor)}
    <p style="color: #666; font-size: 14px;">We look forward to seeing you!</p>
  `

  const html = wrapInBaseTemplate(photographyTheme, content, { title: 'Shoot Reminder' })

  return emailService.sendCustom({
    to,
    subject: `Shoot Reminder - ${shootDate} at ${shootTime}`,
    html,
    text: `Hello, ${clientName}! Reminder: Photo shoot on ${shootDate} at ${shootTime} with ${photographerName}${location ? ` at ${location}` : ''}.`,
  })
}

export async function sendGalleryReadyEmail({
  to,
  clientName,
  galleryName,
  galleryUrl,
  password,
  expiresAt,
}: {
  to: string
  clientName: string
  galleryName: string
  galleryUrl: string
  password?: string
  expiresAt?: string
}): Promise<EmailResult> {
  const galleryInfo = password ? `
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
      <p style="margin: 5px 0;"><strong>Gallery Password:</strong> ${password}</p>
    </div>
  ` : ''

  const content = `
    <p style="font-size: 16px;">Hello, <strong>${clientName}</strong>!</p>
    <p>Great news! Your photo gallery <strong>${galleryName}</strong> is ready for viewing.</p>
    ${galleryInfo}
    ${generateButton('View Gallery', galleryUrl, photographyTheme.primaryColor)}
    ${expiresAt ? `<p style="color: #666; font-size: 14px;">Please note: This gallery link will expire on ${expiresAt}.</p>` : ''}
    <p style="color: #666; font-size: 14px;">Thank you for choosing us for your photography needs!</p>
  `

  const html = wrapInBaseTemplate(photographyTheme, content, { title: 'Your Gallery is Ready!' })

  return emailService.sendCustom({
    to,
    subject: `Your Gallery is Ready - ${galleryName}`,
    html,
    text: `Hello, ${clientName}! Your gallery "${galleryName}" is ready. View it at: ${galleryUrl}${password ? ` (Password: ${password})` : ''}`,
  })
}

// Generic email sending (for backwards compatibility)
export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string | string[]
  subject: string
  html: string
  text?: string
}): Promise<EmailResult> {
  return emailService.sendCustom({ to, subject, html, text })
}
