/**
 * Dunning Processor
 *
 * Handles automated dunning (payment reminder) workflow for overdue invoices.
 */

import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'

interface DunningConfig {
  // Days after due date for each step
  steps: {
    step: number
    daysAfterDue: number
    action: 'reminder_sent' | 'final_notice' | 'collections'
    emailSubject: string
    emailTemplate: 'reminder' | 'final_notice' | 'collections'
  }[]
}

const DEFAULT_DUNNING_CONFIG: DunningConfig = {
  steps: [
    {
      step: 1,
      daysAfterDue: 3,
      action: 'reminder_sent',
      emailSubject: 'Pripominka platby - Faktura {invoiceNumber}',
      emailTemplate: 'reminder',
    },
    {
      step: 2,
      daysAfterDue: 7,
      action: 'reminder_sent',
      emailSubject: 'Druha pripominka - Faktura {invoiceNumber}',
      emailTemplate: 'reminder',
    },
    {
      step: 3,
      daysAfterDue: 14,
      action: 'final_notice',
      emailSubject: 'Posledni upozorneni - Faktura {invoiceNumber}',
      emailTemplate: 'final_notice',
    },
    {
      step: 4,
      daysAfterDue: 30,
      action: 'collections',
      emailSubject: 'Vymahani pohledavky - Faktura {invoiceNumber}',
      emailTemplate: 'collections',
    },
  ],
}

interface ProcessDunningResult {
  processed: number
  emailsSent: number
  errors: { invoiceId: string; error: string }[]
}

/**
 * Process dunning for all overdue invoices
 */
export async function processDunning(
  tenantId?: string,
  config: DunningConfig = DEFAULT_DUNNING_CONFIG
): Promise<ProcessDunningResult> {
  const now = new Date()
  const result: ProcessDunningResult = {
    processed: 0,
    emailsSent: 0,
    errors: [],
  }

  // Find overdue invoices
  const overdueInvoices = await prisma.invoice.findMany({
    where: {
      ...(tenantId && { tenantId }),
      status: { in: ['sent', 'overdue', 'partial'] },
      dueDate: { lt: now },
    },
    include: {
      client: true,
      dunningSteps: {
        orderBy: { step: 'desc' },
        take: 1,
      },
    },
  })

  for (const invoice of overdueInvoices) {
    try {
      const daysOverdue = Math.floor(
        (now.getTime() - invoice.dueDate.getTime()) / (1000 * 60 * 60 * 24)
      )

      const currentDunningLevel = invoice.dunningLevel
      const lastStep = invoice.dunningSteps[0]

      // Find the next applicable dunning step
      const nextStep = config.steps.find(
        (step) =>
          step.step > currentDunningLevel && daysOverdue >= step.daysAfterDue
      )

      if (!nextStep) {
        continue // No dunning action needed
      }

      // Check if enough time has passed since last dunning step
      if (lastStep) {
        const daysSinceLastStep = Math.floor(
          (now.getTime() - lastStep.sentAt.getTime()) / (1000 * 60 * 60 * 24)
        )
        if (daysSinceLastStep < 2) {
          continue // Wait at least 2 days between dunning steps
        }
      }

      // Create dunning step record
      await prisma.dunningStep.create({
        data: {
          tenantId: invoice.tenantId,
          invoiceId: invoice.id,
          step: nextStep.step,
          action: nextStep.action,
          dueDate: invoice.dueDate,
        },
      })

      // Update invoice dunning level
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          dunningLevel: nextStep.step,
          status: 'overdue',
        },
      })

      // Send dunning email
      const emailSent = await sendDunningEmail(
        invoice,
        nextStep.emailSubject,
        nextStep.emailTemplate
      )

      if (emailSent) {
        result.emailsSent++
      }

      result.processed++
    } catch (error) {
      result.errors.push({
        invoiceId: invoice.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  return result
}

/**
 * Send dunning email
 */
async function sendDunningEmail(
  invoice: {
    id: string
    invoiceNumber: string
    total: number
    dueDate: Date
    client: { name: string; email: string }
  },
  subject: string,
  template: 'reminder' | 'final_notice' | 'collections'
): Promise<boolean> {
  const formattedSubject = subject.replace('{invoiceNumber}', invoice.invoiceNumber)
  const formattedDueDate = invoice.dueDate.toLocaleDateString('cs-CZ')
  const amount = `${invoice.total.toFixed(2)} CZK`

  const templates = {
    reminder: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #FEF3C7; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: #92400E; margin: 0; font-size: 24px;">Pripominka platby</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px;">
            <p style="font-size: 16px;">Dobry den, <strong>${invoice.client.name}</strong>!</p>
            <p>Dovolujeme si Vas upozornit, ze faktura <strong>${invoice.invoiceNumber}</strong> se splatnosti <strong>${formattedDueDate}</strong> nebyla dosud uhrazena.</p>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #F59E0B;">
              <p style="margin: 5px 0;"><strong>Cislo faktury:</strong> ${invoice.invoiceNumber}</p>
              <p style="margin: 5px 0;"><strong>Castka:</strong> ${amount}</p>
              <p style="margin: 5px 0;"><strong>Splatnost:</strong> ${formattedDueDate}</p>
            </div>
            <p>Prosime o uhrazeni v nejblizsich dnech. Pokud jste platbu jiz provedli, ignorujte prosim tuto zpravu.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">FitAdmin - Sprava fitness studia</p>
          </div>
        </body>
      </html>
    `,
    final_notice: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #FEE2E2; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: #DC2626; margin: 0; font-size: 24px;">Posledni upozorneni</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px;">
            <p style="font-size: 16px;">Dobry den, <strong>${invoice.client.name}</strong>!</p>
            <p>Navzdory nasim predchozim pripominkam nebyla faktura <strong>${invoice.invoiceNumber}</strong> dosud uhrazena.</p>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #DC2626;">
              <p style="margin: 5px 0;"><strong>Cislo faktury:</strong> ${invoice.invoiceNumber}</p>
              <p style="margin: 5px 0;"><strong>Dluzna castka:</strong> ${amount}</p>
              <p style="margin: 5px 0;"><strong>Splatnost:</strong> ${formattedDueDate}</p>
            </div>
            <p><strong>Toto je posledni upozorneni.</strong> Pokud nebude platba provedena do 7 dnu, budeme nuceni podniknout dalsi kroky.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">FitAdmin - Sprava fitness studia</p>
          </div>
        </body>
      </html>
    `,
    collections: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #1E293B; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Predani k vymahani</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px;">
            <p style="font-size: 16px;">Dobry den, <strong>${invoice.client.name}</strong>.</p>
            <p>S politovanim Vas informujeme, ze pohledavka za fakturu <strong>${invoice.invoiceNumber}</strong> byla predana k vymahani.</p>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1E293B;">
              <p style="margin: 5px 0;"><strong>Cislo faktury:</strong> ${invoice.invoiceNumber}</p>
              <p style="margin: 5px 0;"><strong>Dluzna castka:</strong> ${amount}</p>
            </div>
            <p>Pro vyreseni teto situace nas prosim kontaktujte.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">FitAdmin - Sprava fitness studia</p>
          </div>
        </body>
      </html>
    `,
  }

  try {
    const result = await sendEmail({
      to: invoice.client.email,
      subject: formattedSubject,
      html: templates[template],
    })

    return result.success
  } catch (error) {
    console.error('Failed to send dunning email:', error)
    return false
  }
}

/**
 * Get dunning history for an invoice
 */
export async function getDunningHistory(invoiceId: string) {
  return prisma.dunningStep.findMany({
    where: { invoiceId },
    orderBy: { sentAt: 'asc' },
  })
}

/**
 * Reset dunning level (e.g., after payment arrangement)
 */
export async function resetDunningLevel(invoiceId: string, tenantId: string) {
  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, tenantId },
  })

  if (!invoice) {
    throw new Error('Invoice not found')
  }

  return prisma.invoice.update({
    where: { id: invoiceId },
    data: { dunningLevel: 0 },
  })
}
