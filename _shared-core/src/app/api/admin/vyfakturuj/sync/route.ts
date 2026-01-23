/**
 * Vyfakturuj Customer Sync Routes
 *
 * POST /api/admin/vyfakturuj/sync - Full bidirectional sync
 * GET /api/admin/vyfakturuj/sync - Get sync status
 */

import { NextResponse } from 'next/server'
import {
  fullSync,
  getSyncStatus,
} from '@/lib/vyfakturuj/customer-sync'

// GET /api/admin/vyfakturuj/sync - Get sync status
export async function GET() {
  try {
    const status = await getSyncStatus()

    return NextResponse.json({
      data: status,
    })
  } catch (error) {
    console.error('Error getting sync status:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get sync status' },
      { status: 500 }
    )
  }
}

// POST /api/admin/vyfakturuj/sync - Full bidirectional sync
export async function POST() {
  try {
    const result = await fullSync()

    return NextResponse.json({
      success: result.success,
      message: result.message,
      stats: result.stats,
      errors: result.errors,
    })
  } catch (error) {
    console.error('Error during sync:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Sync failed',
      },
      { status: 500 }
    )
  }
}
