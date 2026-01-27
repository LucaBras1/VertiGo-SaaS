import { NextResponse } from 'next/server'
import {
  processDueSubscriptions,
  sendBillingReminders,
} from '@/lib/subscriptions/subscription-processor'

// Verify cron secret for security
const CRON_SECRET = process.env.CRON_SECRET

export async function GET(request: Request) {
  try {
    // Verify authorization
    const authHeader = request.headers.get('authorization')
    if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get('tenantId') || undefined

    // Process due subscriptions
    const processResult = await processDueSubscriptions(tenantId)

    // Send reminders for upcoming renewals
    const reminderResult = await sendBillingReminders(tenantId, 3)

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      subscriptions: {
        processed: processResult.processed,
        failed: processResult.failed,
        invoicesGenerated: processResult.invoices.length,
        errors: processResult.errors,
      },
      reminders: {
        sent: reminderResult.sent,
        subscriptionIds: reminderResult.subscriptionIds,
      },
    })
  } catch (error) {
    console.error('Subscription processing error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Processing failed',
      },
      { status: 500 }
    )
  }
}

// Allow POST for manual triggers
export async function POST(request: Request) {
  return GET(request)
}
