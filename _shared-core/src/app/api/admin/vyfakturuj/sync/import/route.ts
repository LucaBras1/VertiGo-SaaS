/**
 * Vyfakturuj Import Routes
 *
 * POST /api/admin/vyfakturuj/sync/import - Import all contacts from Vyfakturuj
 * POST with { contactId: number } - Import single contact
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  importAllContactsFromVyfakturuj,
  importContactById,
} from '@/lib/vyfakturuj/customer-sync'

// POST /api/admin/vyfakturuj/sync/import
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))

    if (body.contactId) {
      // Import single contact
      const result = await importContactById(body.contactId)

      return NextResponse.json({
        success: result.success,
        message: result.message,
        stats: result.stats,
      })
    } else {
      // Import all contacts
      const result = await importAllContactsFromVyfakturuj()

      return NextResponse.json({
        success: result.success,
        message: result.message,
        stats: result.stats,
        errors: result.errors,
      })
    }
  } catch (error) {
    console.error('Error during import:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Import failed',
      },
      { status: 500 }
    )
  }
}
