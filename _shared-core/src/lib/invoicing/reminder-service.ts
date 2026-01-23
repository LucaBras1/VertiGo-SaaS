/**
 * Invoice Reminder Service
 *
 * Handles automatic payment reminders for overdue invoices
 */

import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'
import { formatAmount } from '@/types/invoicing'

interface ReminderResult {
  invoiceId: string
  invoiceNumber: string
  customerEmail: string
  reminderLevel: 1 | 2 | 3
  success: boolean
  error?: string
}

/**
 * Process all due reminders
 * Should be called by a daily cron job
 */
export async function processReminders(): Promise<{
  sent: number
  failed: number
  results: ReminderResult[]
}> {
  const results: ReminderResult[] = []

  // Get reminder settings
  const settings = await prisma.invoicingSettings.findUnique({
    where: { id: 'singleton' },
  })

  if (!settings?.enableReminders) {
    return { sent: 0, failed: 0, results }
  }

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  // Get overdue invoices that need reminders
  const overdueInvoices = await prisma.invoice.findMany({
    where: {
      invoiceStatus: { in: ['SENT', 'VIEWED', 'OVERDUE'] },
      dueDate: { lt: today },
    },
    include: {
      customer: true,
    },
  })

  for (const invoice of overdueInvoices) {
    const daysOverdue = Math.floor(
      (today.getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24)
    )

    let reminderLevel: 1 | 2 | 3 | null = null
    let lastSentField: 'reminder1SentAt' | 'reminder2SentAt' | 'reminder3SentAt' | null = null

    // Determine which reminder to send
    if (daysOverdue >= settings.reminder3Days && !invoice.reminder3SentAt) {
      reminderLevel = 3
      lastSentField = 'reminder3SentAt'
    } else if (daysOverdue >= settings.reminder2Days && !invoice.reminder2SentAt) {
      reminderLevel = 2
      lastSentField = 'reminder2SentAt'
    } else if (daysOverdue >= settings.reminder1Days && !invoice.reminder1SentAt) {
      reminderLevel = 1
      lastSentField = 'reminder1SentAt'
    }

    if (!reminderLevel || !lastSentField) continue

    const customerEmail = invoice.customer?.email
    if (!customerEmail) continue

    try {
      // Send reminder email
      await sendReminderEmail(
        invoice as unknown as {
          id: string
          invoiceNumber: string
          totalAmount: number
          paidAmount: number
          dueDate: Date
          customer: { firstName: string; lastName: string; organization?: string }
        },
        customerEmail,
        reminderLevel,
        settings
      )

      // Update invoice
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          [lastSentField]: now,
          invoiceStatus: 'OVERDUE',
          status: 'overdue',
        },
      })

      results.push({
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        customerEmail,
        reminderLevel,
        success: true,
      })
    } catch (error) {
      results.push({
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        customerEmail,
        reminderLevel,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  return {
    sent: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    results,
  }
}

/**
 * Send reminder email
 */
async function sendReminderEmail(
  invoice: {
    id: string
    invoiceNumber: string
    totalAmount: number
    paidAmount: number
    dueDate: Date
    customer: { firstName: string; lastName: string; organization?: string }
  },
  email: string,
  level: 1 | 2 | 3,
  settings: {
    reminderEmailSubject?: string | null
    reminderEmailTemplate?: string | null
    supplierName?: string | null
    supplierEmail?: string | null
    supplierPhone?: string | null
  }
): Promise<void> {
  const remainingAmount = invoice.totalAmount - invoice.paidAmount
  const dueDate = new Date(invoice.dueDate).toLocaleDateString('cs-CZ')
  const customerName = invoice.customer.organization ||
    `${invoice.customer.firstName} ${invoice.customer.lastName}`

  // Subject with level indicator
  const levelTexts = {
    1: 'Upomínka',
    2: 'Druhá upomínka',
    3: 'Poslední upomínka',
  }

  const subject = settings.reminderEmailSubject
    ? settings.reminderEmailSubject
        .replace('{invoiceNumber}', invoice.invoiceNumber)
        .replace('{level}', levelTexts[level])
    : `${levelTexts[level]} - Faktura ${invoice.invoiceNumber}`

  // Generate email HTML
  const html = settings.reminderEmailTemplate
    ? settings.reminderEmailTemplate
        .replace('{customerName}', customerName)
        .replace('{invoiceNumber}', invoice.invoiceNumber)
        .replace('{amount}', formatAmount(remainingAmount))
        .replace('{dueDate}', dueDate)
        .replace('{supplierName}', settings.supplierName || '')
    : generateDefaultReminderHtml(invoice, customerName, level, remainingAmount, dueDate, settings)

  const text = generateDefaultReminderText(invoice, customerName, level, remainingAmount, dueDate, settings)

  await sendEmail({
    to: email,
    subject,
    html,
    text,
    replyTo: settings.supplierEmail || undefined,
  })
}

/**
 * Generate default reminder HTML
 */
function generateDefaultReminderHtml(
  invoice: { invoiceNumber: string },
  customerName: string,
  level: 1 | 2 | 3,
  amount: number,
  dueDate: string,
  settings: { supplierName?: string | null; supplierEmail?: string | null; supplierPhone?: string | null }
): string {
  const urgencyColors = {
    1: '#f59e0b', // Amber
    2: '#ef4444', // Red
    3: '#dc2626', // Dark red
  }

  const urgencyTexts = {
    1: 'Dovolujeme si Vás upozornit, že níže uvedená faktura nebyla dosud uhrazena.',
    2: 'Toto je druhá upomínka. Prosíme o urychlenou úhradu níže uvedené faktury.',
    3: 'Toto je poslední upomínka před předáním pohledávky k vymáhání. Prosíme o okamžitou úhradu.',
  }

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: ${urgencyColors[level]}; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
    .invoice-box { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid ${urgencyColors[level]}; }
    .amount { font-size: 24px; font-weight: bold; color: ${urgencyColors[level]}; }
    .footer { margin-top: 20px; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 style="margin: 0;">${level === 1 ? 'Upomínka' : level === 2 ? 'Druhá upomínka' : 'Poslední upomínka'}</h2>
    </div>
    <div class="content">
      <p>Vážený/á ${customerName},</p>

      <p>${urgencyTexts[level]}</p>

      <div class="invoice-box">
        <p><strong>Číslo faktury:</strong> ${invoice.invoiceNumber}</p>
        <p><strong>Datum splatnosti:</strong> ${dueDate}</p>
        <p><strong>Dlužná částka:</strong> <span class="amount">${formatAmount(amount)}</span></p>
      </div>

      <p>Pokud jste platbu již provedli, považujte prosím tento email za bezpředmětný.</p>

      <p>V případě dotazů nás neváhejte kontaktovat.</p>

      <p>S pozdravem,<br>${settings.supplierName || 'Váš dodavatel'}</p>

      <div class="footer">
        ${settings.supplierEmail ? `<p>Email: ${settings.supplierEmail}</p>` : ''}
        ${settings.supplierPhone ? `<p>Telefon: ${settings.supplierPhone}</p>` : ''}
      </div>
    </div>
  </div>
</body>
</html>
`
}

/**
 * Generate default reminder plain text
 */
function generateDefaultReminderText(
  invoice: { invoiceNumber: string },
  customerName: string,
  level: 1 | 2 | 3,
  amount: number,
  dueDate: string,
  settings: { supplierName?: string | null; supplierEmail?: string | null }
): string {
  const urgencyTexts = {
    1: 'Dovolujeme si Vás upozornit, že níže uvedená faktura nebyla dosud uhrazena.',
    2: 'Toto je druhá upomínka. Prosíme o urychlenou úhradu níže uvedené faktury.',
    3: 'Toto je poslední upomínka před předáním pohledávky k vymáhání. Prosíme o okamžitou úhradu.',
  }

  return `
${level === 1 ? 'UPOMÍNKA' : level === 2 ? 'DRUHÁ UPOMÍNKA' : 'POSLEDNÍ UPOMÍNKA'}

Vážený/á ${customerName},

${urgencyTexts[level]}

Číslo faktury: ${invoice.invoiceNumber}
Datum splatnosti: ${dueDate}
Dlužná částka: ${formatAmount(amount)}

Pokud jste platbu již provedli, považujte prosím tento email za bezpředmětný.

V případě dotazů nás neváhejte kontaktovat.

S pozdravem,
${settings.supplierName || 'Váš dodavatel'}
${settings.supplierEmail ? `Email: ${settings.supplierEmail}` : ''}
`
}

/**
 * Send manual reminder for specific invoice
 */
export async function sendManualReminder(
  invoiceId: string,
  level: 1 | 2 | 3 = 1
): Promise<{ success: boolean; error?: string }> {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { customer: true },
  })

  if (!invoice) {
    return { success: false, error: 'Invoice not found' }
  }

  if (!invoice.customer?.email) {
    return { success: false, error: 'Customer email not found' }
  }

  const settings = await prisma.invoicingSettings.findUnique({
    where: { id: 'singleton' },
  })

  try {
    await sendReminderEmail(
      invoice as unknown as {
        id: string
        invoiceNumber: string
        totalAmount: number
        paidAmount: number
        dueDate: Date
        customer: { firstName: string; lastName: string; organization?: string }
      },
      invoice.customer.email,
      level,
      settings || {}
    )

    // Update reminder sent timestamp
    const field = level === 1 ? 'reminder1SentAt' : level === 2 ? 'reminder2SentAt' : 'reminder3SentAt'
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { [field]: new Date() },
    })

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send reminder',
    }
  }
}

/**
 * Get reminder statistics
 */
export async function getReminderStats(): Promise<{
  pendingReminder1: number
  pendingReminder2: number
  pendingReminder3: number
  sentToday: number
}> {
  const settings = await prisma.invoicingSettings.findUnique({
    where: { id: 'singleton' },
  })

  if (!settings?.enableReminders) {
    return { pendingReminder1: 0, pendingReminder2: 0, pendingReminder3: 0, sentToday: 0 }
  }

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  // Pending reminders
  const overdueInvoices = await prisma.invoice.findMany({
    where: {
      invoiceStatus: { in: ['SENT', 'VIEWED', 'OVERDUE'] },
      dueDate: { lt: today },
    },
    select: {
      dueDate: true,
      reminder1SentAt: true,
      reminder2SentAt: true,
      reminder3SentAt: true,
    },
  })

  let pendingReminder1 = 0
  let pendingReminder2 = 0
  let pendingReminder3 = 0

  for (const invoice of overdueInvoices) {
    const daysOverdue = Math.floor(
      (today.getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24)
    )

    if (daysOverdue >= settings.reminder3Days && !invoice.reminder3SentAt) {
      pendingReminder3++
    } else if (daysOverdue >= settings.reminder2Days && !invoice.reminder2SentAt) {
      pendingReminder2++
    } else if (daysOverdue >= settings.reminder1Days && !invoice.reminder1SentAt) {
      pendingReminder1++
    }
  }

  // Sent today
  const sentToday = await prisma.invoice.count({
    where: {
      OR: [
        { reminder1SentAt: { gte: today } },
        { reminder2SentAt: { gte: today } },
        { reminder3SentAt: { gte: today } },
      ],
    },
  })

  return { pendingReminder1, pendingReminder2, pendingReminder3, sentToday }
}
