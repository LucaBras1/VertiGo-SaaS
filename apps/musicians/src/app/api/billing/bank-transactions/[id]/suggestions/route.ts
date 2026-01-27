import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/billing/bank-transactions/[id]/suggestions
 * Get match suggestions for a transaction
 *
 * TODO: Enable when BankAccount, BankTransaction, InvoicePayment models are added to schema
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return NextResponse.json(
    {
      error: 'Bank transaction suggestions are not yet implemented. Banking models are pending schema migration.',
      status: 'pending_implementation'
    },
    { status: 501 }
  )
}
