// API Route: /api/admin/pages/bulk
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function DELETE(request: NextRequest) {
  try {
    const { ids } = await request.json()
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ success: false, error: 'Invalid request: ids array is required' }, { status: 400 })
    }
    const result = await prisma.page.deleteMany({ where: { id: { in: ids } } })
    return NextResponse.json({ success: true, message: `Smazáno ${result.count} stránek`, data: { deleted: result.count, total: ids.length } })
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Failed' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { ids, data } = await request.json()
    if (!ids || !Array.isArray(ids) || !data) {
      return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 })
    }
    const result = await prisma.page.updateMany({ where: { id: { in: ids } }, data: { ...data, updatedAt: new Date() } })
    return NextResponse.json({ success: true, message: `Aktualizováno ${result.count} stránek`, data: { updated: result.count } })
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Failed' }, { status: 500 })
  }
}
