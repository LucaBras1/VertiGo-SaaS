/**
 * Email Service - GigBook
 * Email notifications for musician gig management
 * Using @vertigo/email shared package
 */

import {
  createEmailService,
  musiciansTheme,
  generateButton,
  generateInfoBox,
  wrapInBaseTemplate,
  type EmailResult,
} from '@vertigo/email'

// Create email service with musicians branding
const emailService = createEmailService({
  branding: musiciansTheme,
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
  expiresIn = '1 hodinu',
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

// Custom musicians-specific templates

export async function sendGigConfirmationEmail({
  to,
  clientName,
  gigName,
  gigDate,
  gigTime,
  venue,
  bandName,
  amount,
  detailsUrl,
}: {
  to: string
  clientName: string
  gigName: string
  gigDate: string
  gigTime: string
  venue: string
  bandName: string
  amount?: string
  detailsUrl?: string
}): Promise<EmailResult> {
  const gigDetails = `
    <p style="margin: 5px 0;"><strong>Akce:</strong> ${gigName}</p>
    <p style="margin: 5px 0;"><strong>Datum:</strong> ${gigDate}</p>
    <p style="margin: 5px 0;"><strong>Čas:</strong> ${gigTime}</p>
    <p style="margin: 5px 0;"><strong>Místo:</strong> ${venue}</p>
    <p style="margin: 5px 0;"><strong>Kapela:</strong> ${bandName}</p>
    ${amount ? `<p style="margin: 5px 0;"><strong>Cena:</strong> ${amount}</p>` : ''}
  `

  const content = `
    <p style="font-size: 16px;">Dobrý den, <strong>${clientName}</strong>!</p>
    <p>S radostí potvrzujeme rezervaci koncertu:</p>
    ${generateInfoBox(gigDetails, musiciansTheme.primaryColor)}
    ${detailsUrl ? generateButton('Zobrazit detaily', detailsUrl, musiciansTheme.primaryColor) : ''}
    <p style="color: #666; font-size: 14px;">Těšíme se na spolupráci!</p>
  `

  const html = wrapInBaseTemplate(musiciansTheme, content, { title: 'Potvrzení koncertu' })

  return emailService.sendCustom({
    to,
    subject: `Potvrzení koncertu: ${gigName} - ${gigDate}`,
    html,
    text: `Dobrý den, ${clientName}! Potvrzujeme rezervaci koncertu "${gigName}" dne ${gigDate} v ${gigTime} na místě ${venue}. Kapela: ${bandName}.${amount ? ` Cena: ${amount}.` : ''}`,
  })
}

// Payment confirmation emails

export async function sendDepositPaymentEmail({
  to,
  clientName,
  gigTitle,
  amount,
  bandName,
}: {
  to: string
  clientName: string
  gigTitle: string
  amount: string
  bandName: string
}): Promise<EmailResult> {
  const paymentDetails = `
    <p style="margin: 5px 0;"><strong>Koncert:</strong> ${gigTitle}</p>
    <p style="margin: 5px 0;"><strong>Zaplacená záloha:</strong> ${amount} Kč</p>
    <p style="margin: 5px 0;"><strong>Datum platby:</strong> ${new Date().toLocaleDateString('cs-CZ')}</p>
  `

  const content = `
    <p style="font-size: 16px;">Dobrý den, <strong>${clientName}</strong>!</p>
    <p>Vaše záloha za koncert byla úspěšně přijata.</p>
    ${generateInfoBox(paymentDetails, musiciansTheme.primaryColor)}
    <p style="color: #666; font-size: 14px;">Děkujeme za Vaši platbu! Těšíme se na spolupráci.</p>
  `

  const html = wrapInBaseTemplate(musiciansTheme, content, { title: 'Potvrzení platby zálohy' })

  return emailService.sendCustom({
    to,
    subject: `Potvrzení platby zálohy - ${gigTitle}`,
    html,
    text: `Dobrý den, ${clientName}! Vaše záloha za koncert "${gigTitle}" ve výši ${amount} Kč byla úspěšně přijata. Děkujeme! ${bandName}`,
  })
}

export async function sendInvoicePaymentEmail({
  to,
  clientName,
  invoiceNumber,
  amount,
  bandName,
}: {
  to: string
  clientName: string
  invoiceNumber: string
  amount: string
  bandName: string
}): Promise<EmailResult> {
  const paymentDetails = `
    <p style="margin: 5px 0;"><strong>Faktura:</strong> ${invoiceNumber}</p>
    <p style="margin: 5px 0;"><strong>Zaplacená částka:</strong> ${amount} Kč</p>
    <p style="margin: 5px 0;"><strong>Datum platby:</strong> ${new Date().toLocaleDateString('cs-CZ')}</p>
  `

  const content = `
    <p style="font-size: 16px;">Dobrý den, <strong>${clientName}</strong>!</p>
    <p>Vaše platba faktury byla úspěšně přijata.</p>
    ${generateInfoBox(paymentDetails, musiciansTheme.primaryColor)}
    <p style="color: #666; font-size: 14px;">Děkujeme za Vaši platbu!</p>
  `

  const html = wrapInBaseTemplate(musiciansTheme, content, { title: 'Potvrzení platby faktury' })

  return emailService.sendCustom({
    to,
    subject: `Potvrzení platby faktury ${invoiceNumber}`,
    html,
    text: `Dobrý den, ${clientName}! Vaše platba faktury ${invoiceNumber} ve výši ${amount} Kč byla úspěšně přijata. Děkujeme! ${bandName}`,
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
