import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { BankTransactionSyncService } from '@vertigo/billing/integrations'

/**
 * GET /api/billing/bank-transactions/[id]/suggestions
 * Get match suggestions for a transaction
 */
export async function GET(
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

    // Get suggestions
    const suggestions = await syncService.getMatchSuggestions(
      id,
      session.user.tenantId
    )

    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error('GET /api/billing/bank-transactions/[id]/suggestions error:', error)

    if (error instanceof Error && error.message === 'Transaction not found') {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to get suggestions' },
      { status: 500 }
    )
  }
}
