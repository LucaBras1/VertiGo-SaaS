import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { recordPartialPayment } from '@/lib/invoices/credit-note-service'
import { z } from 'zod'

const partialPaymentSchema = z.object({
  amount: z.number().positive(),
  paymentMethod: z.enum(['BANK_TRANSFER', 'CARD', 'CASH', 'PAYPAL', 'STRIPE', 'GOPAY']).optional(),
  notes: z.string().max(500).optional(),
})

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: invoiceId } = await params
    const body = await request.json()

    const result = partialPaymentSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: result.error.flatten() },
        { status: 400 }
      )
    }

    const { amount, paymentMethod, notes } = result.data

    const { invoice, payment } = await recordPartialPayment({
      invoiceId,
      tenantId: session.user.tenantId,
      amount,
      paymentMethod,
      notes,
    })

    return NextResponse.json({ invoice, payment })
  } catch (error) {
    console.error('Partial payment error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to record payment' },
      { status: 500 }
    )
  }
}
