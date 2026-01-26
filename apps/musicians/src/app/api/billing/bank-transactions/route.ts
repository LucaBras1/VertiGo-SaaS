import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

/**
 * GET /api/billing/bank-transactions
 * List bank transactions with filtering options
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const bankAccountId = searchParams.get('bankAccountId')
    const isMatched = searchParams.get('isMatched')
    const type = searchParams.get('type')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    // Build where clause
    const where: any = {
      tenantId: session.user.tenantId,
    }

    if (bankAccountId) {
      where.bankAccountId = bankAccountId
    }

    if (isMatched !== null && isMatched !== undefined) {
      where.isMatched = isMatched === 'true'
    }

    if (type) {
      where.type = type
    }

    if (dateFrom || dateTo) {
      where.date = {}
      if (dateFrom) where.date.gte = new Date(dateFrom)
      if (dateTo) where.date.lte = new Date(dateTo)
    }

    // Fetch transactions
    const [transactions, total] = await Promise.all([
      prisma.bankTransaction.findMany({
        where,
        orderBy: { date: 'desc' },
        take: limit,
        skip: offset,
        include: {
          bankAccount: {
            select: {
              id: true,
              accountName: true,
              accountNumber: true,
            },
          },
        },
      }),
      prisma.bankTransaction.count({ where }),
    ])

    return NextResponse.json({
      transactions: transactions.map((tx) => ({
        id: tx.id,
        transactionId: tx.transactionId,
        date: tx.date,
        amount: Number(tx.amount),
        currency: tx.currency,
        type: tx.type,
        counterpartyName: tx.counterpartyName,
        counterpartyAccount: tx.counterpartyAccount,
        description: tx.description,
        variableSymbol: tx.variableSymbol,
        isMatched: tx.isMatched,
        matchedInvoiceId: tx.matchedInvoiceId,
        matchConfidence: tx.matchConfidence,
        matchMethod: tx.matchMethod,
        bankAccount: tx.bankAccount,
        createdAt: tx.createdAt,
      })),
      total,
      limit,
      offset,
    })
  } catch (error) {
    console.error('GET /api/billing/bank-transactions error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}
