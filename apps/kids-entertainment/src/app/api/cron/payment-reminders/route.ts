/**
 * Payment Reminder Cron Job
 * GET /api/cron/payment-reminders - Send reminder emails for invoices due in 3 days
 *
 * Should be triggered daily via external cron service (e.g., Vercel Cron, GitHub Actions)
 * Protected by CRON_SECRET environment variable
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPaymentReminderEmail } from '@/lib/email'

// Type for invoice with included relations
interface InvoiceWithRelations {
  id: string
  invoiceNumber: string
  dueDate: Date
  totalAmount: number
  currency: string
  reminderSentAt: Date | null
  customer: {
    id: string
    email: string
    firstName: string
    lastName: string
  }
  order: {
    id: string
    linkedPartyId: string | null
    linkedParty: {
      id: string
      date: Date
      childName: string | null
    } | null
  } | null
}

export async function GET(request: NextRequest) {
  // Verify CRON_SECRET
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    console.error('CRON_SECRET is not configured')
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 })
  }

  const providedSecret = authHeader?.replace('Bearer ', '')
  if (providedSecret !== cronSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Find invoices due in exactly 3 days
    const now = new Date()
    const threeDaysFromNow = new Date(now)
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)
    threeDaysFromNow.setHours(0, 0, 0, 0)

    const threeDaysEnd = new Date(threeDaysFromNow)
    threeDaysEnd.setHours(23, 59, 59, 999)

    // Find invoices that:
    // 1. Status is not PAID or CANCELLED
    // 2. Due date is in 3 days
    // 3. reminderSentAt is null (reminder not yet sent)
    const invoicesToRemind = await (prisma.invoice.findMany as any)({
      where: {
        invoiceStatus: { notIn: ['PAID', 'CANCELLED'] },
        dueDate: {
          gte: threeDaysFromNow,
          lte: threeDaysEnd,
        },
        reminderSentAt: null,
      },
      include: {
        customer: true,
        order: {
          include: {
            linkedParty: {
              select: {
                id: true,
                date: true,
                childName: true,
              },
            },
          },
        },
      },
    }) as InvoiceWithRelations[]

    console.log(`Found ${invoicesToRemind.length} invoices to send payment reminders`)

    const results = {
      sent: 0,
      errors: 0,
      skipped: 0,
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://partypal.cz'

    for (const invoice of invoicesToRemind) {
      try {
        const customer = invoice.customer

        // Skip if no customer email
        if (!customer?.email) {
          console.warn(`No customer email for invoice ${invoice.id}`)
          results.skipped++
          continue
        }

        // Format dates
        const dueDate = invoice.dueDate.toLocaleDateString('cs-CZ', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })

        // Get party info if available
        const party = invoice.order?.linkedParty
        const partyDate = party?.date
          ? party.date.toLocaleDateString('cs-CZ', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })
          : 'datum oslavy'
        const childName = party?.childName || 'Vašeho dítěte'

        // Format amount
        const amount = `${(invoice.totalAmount / 100).toLocaleString('cs-CZ')} ${invoice.currency}`

        // Build payment URL
        const paymentUrl = `${baseUrl}/payment/${invoice.order?.id || invoice.id}`

        // Send reminder email
        const result = await sendPaymentReminderEmail({
          to: customer.email,
          parentName: `${customer.firstName} ${customer.lastName}`,
          childName,
          partyDate,
          invoiceNumber: invoice.invoiceNumber,
          amount,
          dueDate,
          paymentUrl,
        })

        if (result.success) {
          // Update reminderSentAt
          await (prisma.invoice.update as any)({
            where: { id: invoice.id },
            data: { reminderSentAt: new Date() },
          })
          results.sent++
          console.log(`Payment reminder sent for invoice ${invoice.id}`)
        } else {
          console.error(`Failed to send payment reminder for invoice ${invoice.id}:`, result.error)
          results.errors++
        }
      } catch (error) {
        console.error(`Error processing invoice ${invoice.id}:`, error)
        results.errors++
      }
    }

    return NextResponse.json({
      success: true,
      results,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      {
        error: 'Cron job failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
