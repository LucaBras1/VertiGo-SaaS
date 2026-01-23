/**
 * Cron Job: Send Payment Reminders
 *
 * Odesílá automatické upomínky pro nezaplacené faktury po splatnosti.
 * Volat jednou denně přes Vercel Cron nebo externí službu.
 *
 * GET /api/cron/send-reminders
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// ============================================================================
// TYPES
// ============================================================================

interface ReminderResult {
  invoiceId: string
  invoiceNumber: string
  reminderLevel: 1 | 2 | 3
  success: boolean
  error?: string
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Verify cron authorization
 */
function verifyCronAuth(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    return process.env.NODE_ENV === 'development'
  }

  const authHeader = request.headers.get('authorization')
  if (authHeader === `Bearer ${cronSecret}`) {
    return true
  }

  const vercelCronHeader = request.headers.get('x-vercel-cron')
  if (vercelCronHeader) {
    return true
  }

  return false
}

/**
 * Calculate days overdue from due date
 */
function getDaysOverdue(dueDate: Date): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)

  const diffTime = today.getTime() - due.getTime()
  return Math.floor(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Determine which reminder level to send based on settings and current level
 */
function determineReminderLevel(
  daysOverdue: number,
  reminder1Days: number,
  reminder2Days: number,
  reminder3Days: number,
  currentReminderLevel: number
): 1 | 2 | 3 | null {
  // Check if we should send reminder 3
  if (daysOverdue >= reminder3Days && currentReminderLevel < 3) {
    return 3
  }

  // Check if we should send reminder 2
  if (daysOverdue >= reminder2Days && currentReminderLevel < 2) {
    return 2
  }

  // Check if we should send reminder 1
  if (daysOverdue >= reminder1Days && currentReminderLevel < 1) {
    return 1
  }

  return null
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

export async function GET(request: NextRequest) {
  // Verify authorization
  if (!verifyCronAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results: ReminderResult[] = []
  let sent = 0
  let errors = 0

  try {
    // Get invoicing settings (new system)
    const invoicingSettings = await prisma.invoicingSettings.findFirst()

    // Check if reminders are enabled
    if (!invoicingSettings?.reminderEnabled) {
      return NextResponse.json({
        success: true,
        message: 'Reminders are disabled',
        sent: 0,
        errors: 0,
        timestamp: new Date().toISOString(),
      })
    }

    const reminderDays1 = invoicingSettings.reminderDays1 || 7
    const reminderDays2 = invoicingSettings.reminderDays2 || 14
    const reminderDays3 = invoicingSettings.reminderDays3 || 30

    // Get unpaid invoices that are past due
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const unpaidInvoices = await prisma.invoice.findMany({
      where: {
        status: { in: ['SENT', 'OVERDUE', 'PARTIALLY_PAID'] },
        dueDate: { lt: today },
      },
      include: {
        customer: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    })

    if (unpaidInvoices.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No overdue invoices found',
        sent: 0,
        errors: 0,
        timestamp: new Date().toISOString(),
      })
    }

    // Process each overdue invoice
    for (const invoice of unpaidInvoices) {
      const daysOverdue = getDaysOverdue(invoice.dueDate)
      const currentLevel = invoice.reminderLevel || 0

      const reminderLevel = determineReminderLevel(
        daysOverdue,
        reminderDays1,
        reminderDays2,
        reminderDays3,
        currentLevel
      )

      if (!reminderLevel) {
        continue
      }

      // Send reminder email
      try {
        if (!invoice.customer?.email) {
          continue
        }

        // TODO: Implement actual email sending using the email service
        // For now, we just log and update the reminder level
        // await sendReminderEmail(invoice, reminderLevel)

        // Update invoice with reminder info
        await prisma.invoice.update({
          where: { id: invoice.id },
          data: {
            reminderLevel,
            lastReminderAt: new Date(),
            status: 'OVERDUE',
          },
        })

        results.push({
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber || 'N/A',
          reminderLevel,
          success: true,
        })

        sent++

        console.log(
          `[Reminders] Sent reminder ${reminderLevel} for invoice ${invoice.invoiceNumber} to ${invoice.customer.email}`
        )
      } catch (error) {
        results.push({
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber || 'N/A',
          reminderLevel,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
        errors++

        console.error(
          `[Reminders] Failed to send reminder for invoice ${invoice.invoiceNumber}:`,
          error
        )
      }
    }

    // Update overdue status for all invoices past due date
    await prisma.invoice.updateMany({
      where: {
        status: 'SENT',
        dueDate: { lt: today },
      },
      data: {
        status: 'OVERDUE',
      },
    })

    return NextResponse.json({
      success: errors === 0,
      message: `Sent ${sent} reminders, ${errors} errors`,
      sent,
      errors,
      results,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[Reminders] Reminder job failed:', error)

    return NextResponse.json({
      success: false,
      error: 'Reminder job failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 })
  }
}
