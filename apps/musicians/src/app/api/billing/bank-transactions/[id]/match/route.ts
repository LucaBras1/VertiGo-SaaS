import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { BankTransactionSyncService } from '@vertigo/billing/integrations'
import { z } from 'zod'

const matchSchema = z.object({
  invoiceId: z.string().uuid(),
})

/**
 * POST /api/billing/bank-transactions/[id]/match
 * Match a transaction with an invoice
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const validated = matchSchema.parse(body)

    // Initialize sync service
    const syncService = new BankTransactionSyncService(
      prisma,
      process.env.OPENAI_API_KEY
    )

    // Perform match
    const result = await syncService.matchTransaction(
      id,
      validated.invoiceId,
      session.user.tenantId
    )

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Match failed' },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      )
    }

    console.error('POST /api/billing/bank-transactions/[id]/match error:', error)
    return NextResponse.json(
      { error: 'Failed to match transaction' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/billing/bank-transactions/[id]/match
 * Unmatch a transaction from an invoice
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Initialize sync service
    const syncService = new BankTransactionSyncService(
      prisma,
      process.env.OPENAI_API_KEY
    )

    // Perform unmatch
    const result = await syncService.unmatchTransaction(id, session.user.tenantId)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Unmatch failed' },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/billing/bank-transactions/[id]/match error:', error)
    return NextResponse.json(
      { error: 'Failed to unmatch transaction' },
      { status: 500 }
    )
  }
}
