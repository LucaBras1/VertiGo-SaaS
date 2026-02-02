import { NextResponse } from 'next/server'
import { processAllReminders } from '@/lib/services/reminders'

export const dynamic = 'force-dynamic'
export const maxDuration = 60 // Allow up to 60 seconds for processing

/**
 * Cron job endpoint for sending automated reminders
 *
 * Configure in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/send-reminders",
 *     "schedule": "0 8 * * *"
 *   }]
 * }
 *
 * This will run daily at 8:00 UTC
 */
export async function GET(request: Request) {
  try {
    // Verify cron secret (Vercel sets this automatically for cron jobs)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    // In production, require authorization
    if (process.env.NODE_ENV === 'production') {
      if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    console.log('[Cron] Starting reminder processing...')

    const result = await processAllReminders()

    console.log('[Cron] Reminder processing complete:', result)

    return NextResponse.json({
      success: true,
      data: {
        tenantsProcessed: result.tenantsProcessed,
        remindersProcessed: result.remindersProcessed,
        remindersSent: result.remindersSent,
        errors: result.errors.length,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[Cron] send-reminders error:', error)
    return NextResponse.json(
      {
        error: 'Failed to process reminders',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// Also support POST for manual triggering
export async function POST(request: Request) {
  return GET(request)
}
