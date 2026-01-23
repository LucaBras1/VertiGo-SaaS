/**
 * Vyfakturuj Export Routes
 *
 * POST /api/admin/vyfakturuj/sync/export - Export all unlinked customers to Vyfakturuj
 * POST with { customerId: string } - Export single customer
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  exportAllCustomersToVyfakturuj,
  exportCustomerToVyfakturuj,
} from '@/lib/vyfakturuj/customer-sync'

// POST /api/admin/vyfakturuj/sync/export
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))

    if (body.customerId) {
      // Export single customer
      const result = await exportCustomerToVyfakturuj(body.customerId)

      return NextResponse.json({
        success: result.success,
        message: result.message,
        stats: result.stats,
      })
    } else {
      // Export all unlinked customers
      const result = await exportAllCustomersToVyfakturuj()

      return NextResponse.json({
        success: result.success,
        message: result.message,
        stats: result.stats,
        errors: result.errors,
      })
    }
  } catch (error) {
    console.error('Error during export:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Export failed',
      },
      { status: 500 }
    )
  }
}
