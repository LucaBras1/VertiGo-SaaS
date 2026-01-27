import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/billing/bank-transactions
 * List bank transactions with filtering options
 *
 * TODO: Enable when BankAccount, BankTransaction, InvoicePayment models are added to schema
 */
export async function GET(req: NextRequest) {
  return NextResponse.json(
    {
      error: 'Bank transactions are not yet implemented. Banking models are pending schema migration.',
      status: 'pending_implementation'
    },
    { status: 501 }
  )
}
