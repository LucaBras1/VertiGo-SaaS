/**
 * Email Sequences Cron Job
 * POST /api/email-sequences/cron - Process scheduled emails
 *
 * This endpoint should be called by a cron job (e.g., Vercel Cron)
 * Recommended: Every 15 minutes
 */

import { NextResponse } from 'next/server'
import { processEmailSequences, checkTriggers } from '@/lib/email-sequences'

// Verify cron secret for security
const CRON_SECRET = process.env.CRON_SECRET

export async function POST(request: Request) {
  try {
    // Verify cron secret if set
    if (CRON_SECRET) {
      const authHeader = request.headers.get('authorization')
      if (authHeader !== `Bearer ${CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    // Check triggers for automatic enrollments
    const triggerResult = await checkTriggers()

    // Process scheduled emails
    const processResult = await processEmailSequences()

    return NextResponse.json({
      success: true,
      triggers: triggerResult,
      processing: processResult,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error in email sequences cron:', error)
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 })
  }
}

// Also support GET for Vercel Cron
export async function GET(request: Request) {
  return POST(request)
}
