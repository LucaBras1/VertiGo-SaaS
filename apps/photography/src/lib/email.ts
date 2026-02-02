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

// Payment confirmation email
export async function sendPaymentConfirmationEmail({
  to,
  clientName,
  amount,
  paymentType,
  packageTitle,
  receiptUrl,
}: {
  to: string
  clientName: string
  amount: string
  paymentType: 'deposit' | 'balance' | 'full' | 'invoice'
  packageTitle?: string
  receiptUrl?: string
}): Promise<EmailResult> {
  const paymentLabels = {
    deposit: 'Deposit Payment',
    balance: 'Balance Payment',
    full: 'Full Payment',
    invoice: 'Invoice Payment',
  }

  const paymentInfo = `
    <p style="margin: 5px 0;"><strong>Amount:</strong> ${amount}</p>
    <p style="margin: 5px 0;"><strong>Type:</strong> ${paymentLabels[paymentType]}</p>
    ${packageTitle ? `<p style="margin: 5px 0;"><strong>Package:</strong> ${packageTitle}</p>` : ''}
  `

  const content = `
    <p style="font-size: 16px;">Hello, <strong>${clientName}</strong>!</p>
    <p>Thank you for your payment. We have successfully received your payment.</p>
    ${generateInfoBox(paymentInfo, photographyTheme.primaryColor)}
    ${receiptUrl ? generateButton('View Receipt', receiptUrl, photographyTheme.primaryColor) : ''}
    <p style="color: #666; font-size: 14px;">If you have any questions, please don't hesitate to contact us.</p>
  `

  const html = wrapInBaseTemplate(photographyTheme, content, { title: 'Payment Received' })

  return emailService.sendCustom({
    to,
    subject: `Payment Confirmation - ${paymentLabels[paymentType]}${packageTitle ? ` for ${packageTitle}` : ''}`,
    html,
    text: `Hello, ${clientName}! Thank you for your payment of ${amount}. Type: ${paymentLabels[paymentType]}.${packageTitle ? ` Package: ${packageTitle}` : ''}`,
  })
}

// Contract email - send contract for signing
export async function sendContractEmail({
  to,
  clientName,
  contractTitle,
  signUrl,
  packageTitle,
  expiresAt,
  photographerName,
}: {
  to: string
  clientName: string
  contractTitle: string
  signUrl: string
  packageTitle?: string
  expiresAt?: string
  photographerName: string
}): Promise<EmailResult> {
  const contractInfo = `
    <p style="margin: 5px 0;"><strong>Contract:</strong> ${contractTitle}</p>
    ${packageTitle ? `<p style="margin: 5px 0;"><strong>Package:</strong> ${packageTitle}</p>` : ''}
    <p style="margin: 5px 0;"><strong>Photographer:</strong> ${photographerName}</p>
  `

  const content = `
    <p style="font-size: 16px;">Hello, <strong>${clientName}</strong>!</p>
    <p>Please review and sign the following contract:</p>
    ${generateInfoBox(contractInfo, photographyTheme.primaryColor)}
    ${generateButton('Review & Sign Contract', signUrl, photographyTheme.primaryColor)}
    ${expiresAt ? `<p style="color: #d97706; font-size: 14px;"><strong>Note:</strong> This contract expires on ${expiresAt}. Please sign before this date.</p>` : ''}
    <p style="color: #666; font-size: 14px;">If you have any questions about the contract terms, please contact us before signing.</p>
  `

  const html = wrapInBaseTemplate(photographyTheme, content, { title: 'Contract for Review' })

  return emailService.sendCustom({
    to,
    subject: `Contract Ready for Signing - ${contractTitle}`,
    html,
    text: `Hello, ${clientName}! Please review and sign your contract "${contractTitle}". Sign here: ${signUrl}${expiresAt ? `. Expires: ${expiresAt}` : ''}`,
  })
}

// Contract signed confirmation
export async function sendContractSignedEmail({
  to,
  clientName,
  contractTitle,
  packageTitle,
  pdfUrl,
  photographerName,
}: {
  to: string
  clientName: string
  contractTitle: string
  packageTitle?: string
  pdfUrl?: string
  photographerName: string
}): Promise<EmailResult> {
  const content = `
    <p style="font-size: 16px;">Hello, <strong>${clientName}</strong>!</p>
    <p>Thank you for signing your contract with ${photographerName}.</p>
    ${generateInfoBox(`
      <p style="margin: 5px 0;"><strong>Contract:</strong> ${contractTitle}</p>
      ${packageTitle ? `<p style="margin: 5px 0;"><strong>Package:</strong> ${packageTitle}</p>` : ''}
      <p style="margin: 5px 0;"><strong>Status:</strong> ✅ Signed</p>
    `, '#10B981')}
    ${pdfUrl ? generateButton('Download Signed Contract (PDF)', pdfUrl, photographyTheme.primaryColor) : ''}
    <p style="color: #666; font-size: 14px;">A copy of the signed contract has been saved for your records. We look forward to working with you!</p>
  `

  const html = wrapInBaseTemplate(photographyTheme, content, { title: 'Contract Signed' })

  return emailService.sendCustom({
    to,
    subject: `Contract Signed - ${contractTitle}`,
    html,
    text: `Hello, ${clientName}! Your contract "${contractTitle}" has been signed successfully.${pdfUrl ? ` Download PDF: ${pdfUrl}` : ''}`,
  })
}

// Booking confirmation email
export async function sendBookingConfirmationEmail({
  to,
  clientName,
  packageTitle,
  eventType,
  eventDate,
  shootTime,
  location,
  photographerName,
  totalPrice,
  depositAmount,
  depositPaid,
  nextSteps,
}: {
  to: string
  clientName: string
  packageTitle: string
  eventType?: string
  eventDate?: string
  shootTime?: string
  location?: string
  photographerName: string
  totalPrice?: string
  depositAmount?: string
  depositPaid?: boolean
  nextSteps?: string[]
}): Promise<EmailResult> {
  const bookingDetails = `
    <p style="margin: 5px 0;"><strong>Package:</strong> ${packageTitle}</p>
    ${eventType ? `<p style="margin: 5px 0;"><strong>Type:</strong> ${eventType}</p>` : ''}
    ${eventDate ? `<p style="margin: 5px 0;"><strong>Date:</strong> ${eventDate}</p>` : ''}
    ${shootTime ? `<p style="margin: 5px 0;"><strong>Time:</strong> ${shootTime}</p>` : ''}
    ${location ? `<p style="margin: 5px 0;"><strong>Location:</strong> ${location}</p>` : ''}
    <p style="margin: 5px 0;"><strong>Photographer:</strong> ${photographerName}</p>
    ${totalPrice ? `<p style="margin: 5px 0;"><strong>Total Price:</strong> ${totalPrice}</p>` : ''}
    ${depositAmount ? `<p style="margin: 5px 0;"><strong>Deposit:</strong> ${depositAmount} ${depositPaid ? '(Paid ✅)' : '(Pending)'}</p>` : ''}
  `

  const nextStepsHtml = nextSteps && nextSteps.length > 0
    ? `
      <div style="margin-top: 20px;">
        <p style="font-weight: 600; margin-bottom: 10px;">Next Steps:</p>
        <ol style="padding-left: 20px; color: #374151;">
          ${nextSteps.map(step => `<li style="margin-bottom: 5px;">${step}</li>`).join('')}
        </ol>
      </div>
    `
    : ''

  const content = `
    <p style="font-size: 16px;">Hello, <strong>${clientName}</strong>!</p>
    <p>Great news! Your photography session has been confirmed.</p>
    ${generateInfoBox(bookingDetails, photographyTheme.primaryColor)}
    ${nextStepsHtml}
    <p style="color: #666; font-size: 14px;">We're excited to work with you! If you have any questions, please don't hesitate to reach out.</p>
  `

  const html = wrapInBaseTemplate(photographyTheme, content, { title: 'Booking Confirmed!' })

  return emailService.sendCustom({
    to,
    subject: `Booking Confirmed - ${packageTitle}${eventDate ? ` on ${eventDate}` : ''}`,
    html,
    text: `Hello, ${clientName}! Your booking "${packageTitle}" has been confirmed.${eventDate ? ` Date: ${eventDate}` : ''}${shootTime ? ` Time: ${shootTime}` : ''} Photographer: ${photographerName}`,
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
