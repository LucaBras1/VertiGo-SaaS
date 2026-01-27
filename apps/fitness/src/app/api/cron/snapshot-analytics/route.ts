import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createDailySnapshot } from '@/lib/analytics/metrics-aggregator'

// Verify cron secret for security
const CRON_SECRET = process.env.CRON_SECRET

export async function GET(request: Request) {
  try {
    // Verify authorization
    const authHeader = request.headers.get('authorization')
    if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all tenants
    const tenants = await prisma.tenant.findMany({
      select: { id: true },
    })

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    }

    // Create snapshot for each tenant
    for (const tenant of tenants) {
      try {
        await createDailySnapshot(tenant.id)
        results.success++
      } catch (error) {
        results.failed++
        results.errors.push(
          `Tenant ${tenant.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
        )
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      tenantsProcessed: tenants.length,
      successCount: results.success,
      failedCount: results.failed,
      errors: results.errors,
    })
  } catch (error) {
    console.error('Snapshot analytics cron error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Snapshot failed',
      },
      { status: 500 }
    )
  }
}

// Allow POST for manual triggers
export async function POST(request: Request) {
  return GET(request)
}
