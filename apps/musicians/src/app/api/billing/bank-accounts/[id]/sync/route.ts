import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { BankTransactionSyncService } from '@vertigo/billing/integrations'

/**
 * POST /api/billing/bank-accounts/[id]/sync
 * Trigger manual sync for a bank account
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
    const body = await req.json().catch(() => ({}))

    // Fetch bank account
    const bankAccount = await prisma.bankAccount.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId,
        isActive: true,
      },
    })

    if (!bankAccount) {
      return NextResponse.json(
        { error: 'Bank account not found' },
        { status: 404 }
      )
    }

    // Initialize sync service
    const syncService = new BankTransactionSyncService(
      prisma,
      process.env.OPENAI_API_KEY
    )

    // Parse date range from request body
    const dateFrom = body.dateFrom ? new Date(body.dateFrom) : undefined
    const dateTo = body.dateTo ? new Date(body.dateTo) : undefined

    // Perform sync
    const result = await syncService.syncAccount(
      bankAccount as any,
      dateFrom,
      dateTo
    )

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Sync failed' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      transactionsImported: result.transactionsImported,
      transactionsMatched: result.transactionsMatched,
      dateFrom: result.dateFrom,
      dateTo: result.dateTo,
      timestamp: result.timestamp,
    })
  } catch (error) {
    console.error('POST /api/billing/bank-accounts/[id]/sync error:', error)
    return NextResponse.json(
      { error: 'Failed to sync bank account' },
      { status: 500 }
    )
  }
}
