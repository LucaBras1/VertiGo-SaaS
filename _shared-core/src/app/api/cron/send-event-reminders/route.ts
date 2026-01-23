/**
 * Cron Job: Send Event Reminders
 *
 * Odesílá automatické připomínky před potvrzenou akcí zákazníkovi i adminovi.
 * Volat jednou denně přes Vercel Cron nebo externí službu.
 *
 * Schedule: "0 9 * * *" (každý den v 9:00 UTC)
 *
 * GET /api/cron/send-event-reminders
 *
 * Authorization:
 * - Bearer token v Authorization header (CRON_SECRET)
 * - x-vercel-cron header (automaticky od Vercel)
 * - V development mode bez CRON_SECRET je povoleno
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'
import {
  generateEventReminderHtml,
  generateEventReminderText,
  getEventReminderSubject,
  ReminderEmailSettings,
} from '@/lib/email/templates/event-reminder'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Logging prefix for consistent log filtering
const LOG_PREFIX = '[Event Reminders]'

// ============================================================================
// TYPES
// ============================================================================

type ErrorCategory = 'no_email' | 'email_send_failed' | 'database_error' | 'unknown'

interface ReminderResult {
  orderId: string
  orderNumber: string
  customerEmail: string
  eventDate: string | null
  daysUntilEvent: number | null
  success: boolean
  error?: string
  errorCategory?: ErrorCategory
  customerEmailSent?: boolean
  adminEmailSent?: boolean
}

interface CronResponse {
  success: boolean
  message: string
  processed: number
  sent: number
  failed: number
  skipped: number
  results: ReminderResult[]
  timestamp: string
  executionTimeMs: number
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Verify cron authorization
 * Supports: Bearer token, Vercel cron header, dev mode
 */
function verifyCronAuth(request: NextRequest): { authorized: boolean; method: string } {
  const cronSecret = process.env.CRON_SECRET

  // Check Authorization header first
  const authHeader = request.headers.get('authorization')
  if (authHeader && cronSecret && authHeader === `Bearer ${cronSecret}`) {
    return { authorized: true, method: 'bearer_token' }
  }

  // Check Vercel Cron header (automatically set by Vercel)
  const vercelCronHeader = request.headers.get('x-vercel-cron')
  if (vercelCronHeader) {
    return { authorized: true, method: 'vercel_cron' }
  }

  // Allow in development if no secret is configured
  if (!cronSecret && process.env.NODE_ENV === 'development') {
    console.warn(`${LOG_PREFIX} Running in development mode without CRON_SECRET`)
    return { authorized: true, method: 'development' }
  }

  return { authorized: false, method: 'none' }
}

/**
 * Get days until event from today
 */
function getDaysUntilEvent(eventDate: Date): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const event = new Date(eventDate)
  event.setHours(0, 0, 0, 0)

  const diffTime = event.getTime() - today.getTime()
  return Math.floor(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Get the earliest date from an array of date strings
 */
function getEarliestDate(dates: string[]): Date | null {
  if (!dates || dates.length === 0) return null

  const parsedDates = dates
    .map((d) => new Date(d))
    .filter((d) => !isNaN(d.getTime()))
    .sort((a, b) => a.getTime() - b.getTime())

  return parsedDates[0] || null
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  const timestamp = new Date().toISOString()

  // Verify authorization
  const auth = verifyCronAuth(request)
  if (!auth.authorized) {
    console.warn(`${LOG_PREFIX} Unauthorized access attempt at ${timestamp}`)
    return NextResponse.json(
      {
        success: false,
        error: 'Unauthorized - missing or invalid CRON_SECRET',
        timestamp,
      },
      { status: 401 }
    )
  }

  console.log(`${LOG_PREFIX} Starting cron job (auth: ${auth.method}) at ${timestamp}`)

  const results: ReminderResult[] = []
  let skipped = 0

  try {
    // Load settings
    const settings = await prisma.settings.findFirst({
      select: {
        enableEventReminders: true,
        eventReminderDaysBefore: true,
        eventReminderEmailSubject: true,
        eventReminderEmailIntro: true,
        emailTo: true,
        // Cancellation fee settings
        cancellationFeeEnabled: true,
        cancellationFeeDaysBefore: true,
        cancellationFeeType: true,
        cancellationFeeValue: true,
        cancellationFeeText: true,
        // Company info for email
        offerEmailCompanyName: true,
        offerEmailCompanyEmail: true,
        offerEmailCompanyWeb: true,
      },
    })

    // Check if reminders are enabled
    if (!settings?.enableEventReminders) {
      console.log(`${LOG_PREFIX} Event reminders are disabled in settings`)
      return NextResponse.json({
        success: true,
        message: 'Event reminders are disabled in settings',
        processed: 0,
        sent: 0,
        failed: 0,
        skipped: 0,
        results: [],
        timestamp,
        executionTimeMs: Date.now() - startTime,
      } as CronResponse)
    }

    const daysBefore = settings.eventReminderDaysBefore || 30
    const adminEmail = settings.emailTo

    // Calculate target date (today + daysBefore)
    const targetDate = new Date()
    targetDate.setDate(targetDate.getDate() + daysBefore)
    targetDate.setHours(0, 0, 0, 0)

    // Find confirmed orders that need reminders
    const orders = await prisma.order.findMany({
      where: {
        status: 'confirmed',
        eventReminderSentAt: null,
      },
      include: {
        customer: true,
        items: {
          include: {
            performance: true,
            game: true,
            service: true,
          },
        },
      },
    })

    // Filter orders where earliest event date matches target
    const ordersToRemind = orders.filter((order) => {
      const dates = order.dates as string[]
      const earliestDate = getEarliestDate(dates)
      if (!earliestDate) return false

      const daysUntil = getDaysUntilEvent(earliestDate)
      // Send reminder if days until event equals or is less than daysBefore
      // but only if the event hasn't happened yet
      return daysUntil === daysBefore
    })

    console.log(`${LOG_PREFIX} Found ${orders.length} confirmed orders, ${ordersToRemind.length} need reminders (${daysBefore} days before event)`)

    // Prepare email settings
    const emailSettings: ReminderEmailSettings = {
      subject: settings.eventReminderEmailSubject,
      intro: settings.eventReminderEmailIntro,
      companyName: settings.offerEmailCompanyName,
      companyEmail: settings.offerEmailCompanyEmail,
      companyWeb: settings.offerEmailCompanyWeb,
      cancellationFeeEnabled: settings.cancellationFeeEnabled,
      cancellationFeeDaysBefore: settings.cancellationFeeDaysBefore,
      cancellationFeeType: settings.cancellationFeeType,
      cancellationFeeValue: settings.cancellationFeeValue,
      cancellationFeeText: settings.cancellationFeeText,
    }

    // Process each order
    for (const order of ordersToRemind) {
      const dates = order.dates as string[]
      const earliestDate = getEarliestDate(dates)
      const daysUntil = earliestDate ? getDaysUntilEvent(earliestDate) : null

      const result: ReminderResult = {
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerEmail: order.customer?.email || 'N/A',
        eventDate: earliestDate?.toISOString().split('T')[0] || null,
        daysUntilEvent: daysUntil,
        success: false,
        customerEmailSent: false,
        adminEmailSent: false,
      }

      try {
        // Skip if no customer or no email
        if (!order.customer?.email) {
          result.error = 'Customer has no email address'
          result.errorCategory = 'no_email'
          skipped++
          results.push(result)
          console.warn(`${LOG_PREFIX} Skipping order ${order.orderNumber}: no customer email`)
          continue
        }

        // Prepare order data for email
        const venue = order.venue as any
        const pricing = order.pricing as any

        const orderData = {
          orderNumber: order.orderNumber,
          eventName: order.eventName || '',
          dates,
          venue: {
            name: venue?.name || '',
            street: venue?.street,
            city: venue?.city,
            postalCode: venue?.postalCode,
          },
          items: order.items.map((item) => ({
            name: item.performance?.title || item.game?.title || item.service?.title || 'Položka',
            date: item.date || undefined,
            startTime: item.startTime || undefined,
            endTime: item.endTime || undefined,
            price: item.price || 0,
          })),
          pricing: {
            subtotal: pricing?.subtotal,
            travelCosts: pricing?.travelCosts,
            discount: pricing?.discount,
            totalPrice: pricing?.totalPrice || 0,
            vatIncluded: pricing?.vatIncluded,
          },
          customer: {
            firstName: order.customer.firstName,
            lastName: order.customer.lastName,
            organization: order.customer.organization || undefined,
            email: order.customer.email,
          },
        }

        const firstDate = dates[0] || ''
        const subject = getEventReminderSubject(order.eventName || '', firstDate, emailSettings)

        // Send email to customer
        const customerEmailHtml = generateEventReminderHtml(orderData, emailSettings, false)
        const customerEmailText = generateEventReminderText(orderData, emailSettings, false)

        const customerSent = await sendEmail({
          to: order.customer.email,
          subject,
          html: customerEmailHtml,
          text: customerEmailText,
        })

        if (!customerSent) {
          result.error = 'Failed to send email to customer'
          result.errorCategory = 'email_send_failed'
          console.error(`${LOG_PREFIX} Failed to send customer email for order ${order.orderNumber}`)
          results.push(result)
          continue
        }

        result.customerEmailSent = true

        // Send admin copy if adminEmail is configured
        if (adminEmail) {
          const adminEmailHtml = generateEventReminderHtml(orderData, emailSettings, true)
          const adminEmailText = generateEventReminderText(orderData, emailSettings, true)

          const adminSent = await sendEmail({
            to: adminEmail,
            subject: `[Kopie] ${subject}`,
            html: adminEmailHtml,
            text: adminEmailText,
          })

          result.adminEmailSent = adminSent
          if (!adminSent) {
            console.warn(`${LOG_PREFIX} Admin email failed for order ${order.orderNumber}, but customer email was sent`)
          }
        }

        // Update order to mark reminder as sent
        await prisma.order.update({
          where: { id: order.id },
          data: {
            eventReminderSentAt: new Date(),
          },
        })

        // Log communication
        await prisma.communication.create({
          data: {
            type: 'email',
            direction: 'outgoing',
            subject,
            content: `Automatická připomínka odeslána na ${order.customer.email}${adminEmail ? ` (kopie: ${adminEmail})` : ''}`,
            customerId: order.customerId,
            orderId: order.id,
          },
        })

        result.success = true
        console.log(`${LOG_PREFIX} ✓ Sent reminder for order ${order.orderNumber} to ${order.customer.email}`)
      } catch (error) {
        result.error = error instanceof Error ? error.message : 'Unknown error'
        result.errorCategory = error instanceof Error && error.message.includes('database')
          ? 'database_error'
          : 'unknown'
        console.error(`${LOG_PREFIX} ✗ Error processing order ${order.orderNumber}:`, error)
      }

      results.push(result)
    }

    const successCount = results.filter((r) => r.success).length
    const failCount = results.filter((r) => !r.success && r.errorCategory !== 'no_email').length
    const executionTimeMs = Date.now() - startTime

    console.log(`${LOG_PREFIX} Completed: ${successCount} sent, ${failCount} failed, ${skipped} skipped (${executionTimeMs}ms)`)

    return NextResponse.json({
      success: failCount === 0,
      message: `Processed ${results.length} orders: ${successCount} sent, ${failCount} failed, ${skipped} skipped`,
      processed: results.length,
      sent: successCount,
      failed: failCount,
      skipped,
      results,
      timestamp,
      executionTimeMs,
    } as CronResponse)
  } catch (error) {
    const executionTimeMs = Date.now() - startTime
    console.error(`${LOG_PREFIX} Critical error in cron job:`, error)
    return NextResponse.json(
      {
        success: false,
        message: 'Cron job failed with critical error',
        error: error instanceof Error ? error.message : 'Unknown error',
        processed: results.length,
        sent: results.filter((r) => r.success).length,
        failed: results.filter((r) => !r.success).length,
        skipped,
        results,
        timestamp,
        executionTimeMs,
      },
      { status: 500 }
    )
  }
}
