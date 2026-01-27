import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/billing/bank-accounts/[id]/sync
 * Trigger manual sync for a bank account
 *
 * TODO: Enable when BankAccount, BankTransaction, InvoicePayment models are added to schema
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return NextResponse.json(
    {
      error: 'Bank account sync is not yet implemented. Banking models are pending schema migration.',
      status: 'pending_implementation'
    },
    { status: 501 }
  )
}
