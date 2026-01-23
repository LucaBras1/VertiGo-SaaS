/**
 * Migration API
 *
 * API pro migraci dat z Vyfakturuj.cz
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  migrateFromVyfakturuj,
  getMigrationStatus,
  verifyMigration,
} from '@/lib/invoicing/migration'

/**
 * GET - Získat stav migrace
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'verify') {
      const verification = await verifyMigration()
      return NextResponse.json(verification)
    }

    const status = await getMigrationStatus()
    return NextResponse.json(status)
  } catch (error) {
    console.error('Error getting migration status:', error)
    return NextResponse.json(
      { error: 'Failed to get migration status' },
      { status: 500 }
    )
  }
}

/**
 * POST - Spustit migraci
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Spustit migraci
    const result = await migrateFromVyfakturuj((progress) => {
      // Progress callback - můžeme logovat nebo ukládat do cache pro polling
      console.log(`[Migration] ${progress.phase}: ${progress.message}`)
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error running migration:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Migration failed',
      },
      { status: 500 }
    )
  }
}
