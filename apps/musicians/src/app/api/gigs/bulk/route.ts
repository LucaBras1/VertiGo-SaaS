import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'


// Force dynamic to avoid build-time Prisma proxy issues
export const dynamic = 'force-dynamic'
const bulkDeleteSchema = z.object({
  ids: z.array(z.string()).min(1),
})

const bulkUpdateSchema = z.object({
  ids: z.array(z.string()).min(1),
  status: z.enum(['INQUIRY', 'QUOTE_SENT', 'CONFIRMED', 'COMPLETED', 'CANCELLED']),
})

// POST /api/gigs/bulk - Bulk delete
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { ids } = bulkDeleteSchema.parse(body)

    // Delete gigs (cascade will handle related setlists, extras, invoices)
    const result = await prisma.gig.deleteMany({
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
    console.error('Bulk delete gigs error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/gigs/bulk - Bulk status update
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { ids, status } = bulkUpdateSchema.parse(body)

    const result = await prisma.gig.updateMany({
      where: {
        id: { in: ids },
        tenantId: session.user.tenantId,
      },
      data: { status },
    })

    return NextResponse.json({
      success: true,
      updated: result.count,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Bulk update gigs error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
