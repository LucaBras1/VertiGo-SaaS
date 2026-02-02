/**
 * Email Service - FitAdmin
 * Email notifications for fitness management
 * Using @vertigo/email shared package
 */

import {
  createEmailService,
  fitnessTheme,
  generateButton,
  generateInfoBox,
  wrapInBaseTemplate,
  type EmailResult,
} from '@vertigo/email'

// Create email service with fitness branding
const emailService = createEmailService({
  branding: fitnessTheme,
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

// Custom fitness-specific templates

export async function sendSessionReminderEmail({
  to,
  clientName,
  trainerName,
  sessionDate,
  sessionTime,
  duration,
  location,
}: {
  to: string
  clientName: string
  trainerName: string
  sessionDate: string
  sessionTime: string
  duration: number
  location?: string
}): Promise<EmailResult> {
  const eventDetails = `
    <p style="margin: 5px 0;"><strong>Datum:</strong> ${sessionDate}</p>
    <p style="margin: 5px 0;"><strong>Čas:</strong> ${sessionTime}</p>
    <p style="margin: 5px 0;"><strong>Délka:</strong> ${duration} minut</p>
    <p style="margin: 5px 0;"><strong>Trenér:</strong> ${trainerName}</p>
    ${location ? `<p style="margin: 5px 0;"><strong>Místo:</strong> ${location}</p>` : ''}
  `

  const content = `
    <p style="font-size: 16px;">Dobrý den, <strong>${clientName}</strong>!</p>
    <p>Připomínáme vám blížící se trénink:</p>
    ${generateInfoBox(eventDetails, fitnessTheme.primaryColor)}
    <p style="color: #666; font-size: 14px;">Těšíme se na vás!</p>
  `

  const html = wrapInBaseTemplate(fitnessTheme, content, { title: 'Připomínka tréninku' })

  return emailService.sendCustom({
    to,
    subject: `Připomínka tréninku - ${sessionDate} v ${sessionTime}`,
    html,
    text: `Dobrý den, ${clientName}! Připomínáme trénink dne ${sessionDate} v ${sessionTime} (${duration} min) s trenérem ${trainerName}.`,
  })
}

export async function sendBillingReminderEmail({
  to,
  clientName,
  packageName,
  amount,
  currency,
  nextBillingDate,
  frequency,
  manageUrl,
}: {
  to: string
  clientName: string
  packageName?: string | null
  amount: number | string
  currency: string
  nextBillingDate: Date
  frequency: string
  manageUrl?: string
}): Promise<EmailResult> {
  const formattedAmount = typeof amount === 'number'
    ? amount.toLocaleString('cs-CZ')
    : amount
  const formattedDate = nextBillingDate.toLocaleDateString('cs-CZ', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const frequencyText: Record<string, string> = {
    WEEKLY: 'týdenní',
    BIWEEKLY: 'čtrnáctidenní',
    MONTHLY: 'měsíční',
    QUARTERLY: 'čtvrtletní',
    YEARLY: 'roční',
  }

  const billingDetails = `
    ${packageName ? `<p style="margin: 5px 0;"><strong>Balíček:</strong> ${packageName}</p>` : ''}
    <p style="margin: 5px 0;"><strong>Částka:</strong> ${formattedAmount} ${currency}</p>
    <p style="margin: 5px 0;"><strong>Datum platby:</strong> ${formattedDate}</p>
    <p style="margin: 5px 0;"><strong>Frekvence:</strong> ${frequencyText[frequency] || frequency}</p>
  `

  const content = `
    <p style="font-size: 16px;">Dobrý den, <strong>${clientName}</strong>!</p>
    <p>Rádi bychom Vás upozornili na blížící se platbu za Vaše předplatné.</p>
    ${generateInfoBox(billingDetails, '#F59E0B')}
    <p style="color: #666; font-size: 14px;">Ujistěte se prosím, že máte na účtu dostatek prostředků pro úspěšné zpracování platby.</p>
    ${manageUrl ? generateButton('Spravovat předplatné', manageUrl, fitnessTheme.primaryColor) : ''}
  `

  const html = wrapInBaseTemplate(fitnessTheme, content, { title: 'Připomínka platby' })

  return emailService.sendCustom({
    to,
    subject: `Připomínka platby - ${formattedDate}`,
    html,
    text: `Dobrý den, ${clientName}! Připomínáme blížící se platbu ${formattedAmount} ${currency} dne ${formattedDate}${packageName ? ` za balíček ${packageName}` : ''}.`,
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
