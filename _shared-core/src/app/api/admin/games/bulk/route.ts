// API Route: /api/admin/games/bulk
// Bulk operations for games

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { ids } = body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid request: ids array is required' },
        { status: 400 }
      )
    }

    const result = await prisma.game.deleteMany({
      where: { id: { in: ids } },
    })

    return NextResponse.json({
      success: true,
      message: `Smazáno ${result.count} her`,
      data: { deleted: result.count, total: ids.length },
    })
  } catch (error) {
    console.error('Error deleting games:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to delete games' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { ids, data } = body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid request: ids array is required' },
        { status: 400 }
      )
    }

    if (!data || typeof data !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Invalid request: data object is required' },
        { status: 400 }
      )
    }

    const result = await prisma.game.updateMany({
      where: { id: { in: ids } },
      data: { ...data, updatedAt: new Date() },
    })

    return NextResponse.json({
      success: true,
      message: `Aktualizováno ${result.count} her`,
      data: { updated: result.count, total: ids.length },
    })
  } catch (error) {
    console.error('Error updating games:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to update games' },
      { status: 500 }
    )
  }
}
