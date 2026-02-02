import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { bulkDeleteClients } from '@/lib/services/clients'
import { z } from 'zod'

// Force dynamic to avoid build-time Prisma proxy issues
export const dynamic = 'force-dynamic'

const bulkActionSchema = z.object({
  action: z.literal('delete'),
  ids: z.array(z.string()).min(1, 'At least one ID is required'),
})

/**
 * POST /api/clients/bulk
 * Bulk operations on clients
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = bulkActionSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.errors },
        { status: 400 }
      )
    }

    const { action, ids } = parsed.data

    if (action === 'delete') {
      const result = await bulkDeleteClients(ids, session.user.tenantId)
      return NextResponse.json(result)
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (error) {
    console.error('POST /api/clients/bulk error:', error)
    return NextResponse.json(
      { error: 'Failed to process bulk action' },
      { status: 500 }
    )
  }
}
