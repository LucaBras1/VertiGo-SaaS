/**
 * Cron Job: Sync Invoice Statuses
 *
 * Periodická synchronizace stavů faktur z Vyfakturuj.
 * Volat každou hodinu přes Vercel Cron nebo externí službu.
 *
 * GET /api/cron/sync-invoices
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { syncAllInvoicesStatus } from '@/lib/vyfakturuj/invoice-sync'

/**
 * Verify cron authorization
 */
function verifyCronAuth(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET

  // If no secret is configured, allow in development
  if (!cronSecret) {
    return process.env.NODE_ENV === 'development'
  }

  // Check Authorization header
  const authHeader = request.headers.get('authorization')
  if (authHeader === `Bearer ${cronSecret}`) {
    return true
  }

  // Check Vercel Cron header (for Vercel deployments)
  const vercelCronHeader = request.headers.get('x-vercel-cron')
  if (vercelCronHeader) {
    return true
  }

  return false
}

export async function GET(request: NextRequest) {
  // Verify authorization
  if (!verifyCronAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Check if Vyfakturuj is configured
    const settings = await prisma.vyfakturujSettings.findFirst({
      where: { id: 'singleton' },
    })

    if (!settings?.isConfigured) {
      return NextResponse.json({
        success: false,
        message: 'Vyfakturuj is not configured',
        timestamp: new Date().toISOString(),
      })
    }

    // Sync all invoice statuses
    const result = await syncAllInvoicesStatus()

    // Log the sync
    console.log(`[Cron] Invoice sync completed: ${result.synced} synced, ${result.errors} errors`)

    return NextResponse.json({
      success: result.success,
      message: result.message,
      synced: result.synced,
      errors: result.errors,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[Cron] Invoice sync failed:', error)

    return NextResponse.json({
      success: false,
      error: 'Sync failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 })
  }
}
