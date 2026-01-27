import { NextResponse } from 'next/server'
import { processDunning } from '@/lib/invoices/dunning-processor'

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

    const result = await processDunning(tenantId)

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      processed: result.processed,
      emailsSent: result.emailsSent,
      errors: result.errors,
    })
  } catch (error) {
    console.error('Dunning processing error:', error)
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
