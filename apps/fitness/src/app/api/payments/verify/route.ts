import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { getPaymentStatus } from '@/lib/stripe'

const verifySchema = z.object({
  sessionId: z.string().min(1),
})

/**
 * POST /api/payments/verify
 *
 * Verify payment status from Stripe
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { sessionId } = verifySchema.parse(body)

    // Get payment status from Stripe
    const paymentStatus = await getPaymentStatus(sessionId)

    return NextResponse.json({
      status: paymentStatus.status,
      amount: paymentStatus.amountTotal,
      email: paymentStatus.customerEmail,
      metadata: paymentStatus.metadata,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Neplatná data', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error verifying payment:', error)
    return NextResponse.json(
      { error: 'Chyba při ověřování platby' },
      { status: 500 }
    )
  }
}
