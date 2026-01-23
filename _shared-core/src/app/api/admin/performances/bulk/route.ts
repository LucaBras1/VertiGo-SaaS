// API Route: /api/admin/performances/bulk
// Bulk operations for performances

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * DELETE /api/admin/performances/bulk
 * Delete multiple performances by IDs
 *
 * Request body: { ids: string[] }
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { ids } = body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request: ids array is required',
        },
        { status: 400 }
      )
    }

    // Delete all performances with provided IDs
    const result = await prisma.performance.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: `Smazáno ${result.count} inscenací`,
      data: {
        deleted: result.count,
        total: ids.length,
      },
    })
  } catch (error) {
    console.error('Error deleting performances:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete performances',
      },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/performances/bulk
 * Update multiple performances with the same data
 *
 * Request body: { ids: string[], data: Partial<Performance> }
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { ids, data } = body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request: ids array is required',
        },
        { status: 400 }
      )
    }

    if (!data || typeof data !== 'object') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request: data object is required',
        },
        { status: 400 }
      )
    }

    // Update all performances with provided IDs
    const result = await prisma.performance.updateMany({
      where: {
        id: {
          in: ids,
        },
      },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      message: `Aktualizováno ${result.count} inscenací`,
      data: {
        updated: result.count,
        total: ids.length,
      },
    })
  } catch (error) {
    console.error('Error updating performances:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update performances',
      },
      { status: 500 }
    )
  }
}
