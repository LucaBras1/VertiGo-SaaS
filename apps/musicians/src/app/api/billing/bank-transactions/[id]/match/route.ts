import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/billing/bank-transactions/[id]/match
 * Match a transaction with an invoice
 *
 * DELETE /api/billing/bank-transactions/[id]/match
 * Unmatch a transaction from an invoice
 *
 * TODO: Enable when BankAccount, BankTransaction, InvoicePayment models are added to schema
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return NextResponse.json(
    {
      error: 'Bank transaction matching is not yet implemented. Banking models are pending schema migration.',
      status: 'pending_implementation'
    },
    { status: 501 }
  )
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return NextResponse.json(
    {
      error: 'Bank transaction unmatching is not yet implemented. Banking models are pending schema migration.',
      status: 'pending_implementation'
    },
    { status: 501 }
  )
}
