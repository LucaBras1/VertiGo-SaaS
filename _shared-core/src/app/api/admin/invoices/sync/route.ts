/**
 * Invoices Sync API Route
 *
 * POST /api/admin/invoices/sync - Sync all invoice statuses from Vyfakturuj
 */

import { NextResponse } from 'next/server'
import { syncAllInvoicesStatus } from '@/lib/vyfakturuj/invoice-sync'

// POST /api/admin/invoices/sync - Sync all invoice statuses
export async function POST() {
  try {
    const result = await syncAllInvoicesStatus()

    return NextResponse.json({
      success: result.success,
      message: result.message,
      stats: {
        synced: result.synced,
        errors: result.errors,
      },
    })
  } catch (error) {
    console.error('Error syncing invoices:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Sync failed',
      },
      { status: 500 }
    )
  }
}
