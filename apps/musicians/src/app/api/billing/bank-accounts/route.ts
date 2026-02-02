import { NextRequest, NextResponse } from 'next/server';


// Force dynamic to avoid build-time issues
export const dynamic = 'force-dynamic'
/**
 * GET /api/billing/bank-accounts
 * List bank accounts
 *
 * POST /api/billing/bank-accounts
 * Create a bank account
 *
 * TODO: Enable when BankAccount, BankTransaction, InvoicePayment models are added to schema
 */
export async function GET(req: NextRequest) {
  return NextResponse.json(
    {
      error: 'Bank accounts are not yet implemented. Banking models are pending schema migration.',
      status: 'pending_implementation'
    },
    { status: 501 }
  )
}

export async function POST(req: NextRequest) {
  return NextResponse.json(
    {
      error: 'Bank account creation is not yet implemented. Banking models are pending schema migration.',
      status: 'pending_implementation'
    },
    { status: 501 }
  )
}
