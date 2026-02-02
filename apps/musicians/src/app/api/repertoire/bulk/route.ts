import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const bulkDeleteSchema = z.object({
  ids: z.array(z.string()).min(1),
})

// POST /api/repertoire/bulk - Bulk delete
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { ids } = bulkDeleteSchema.parse(body)

    const result = await prisma.repertoireSong.deleteMany({
      where: {
        id: { in: ids },
        tenantId: session.user.tenantId,
      },
    })

    return NextResponse.json({
      success: true,
      deleted: result.count,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Bulk delete repertoire error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
