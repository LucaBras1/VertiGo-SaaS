import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { StripeClient } from '@vertigo/billing/integrations'
import { z } from 'zod'


// Force dynamic to avoid build-time Prisma proxy issues
export const dynamic = 'force-dynamic'
// Initialize Stripe client
function getStripeClient(): StripeClient {
  const secretKey = process.env.STRIPE_SECRET_KEY

  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured')
  }

  return new StripeClient({
    secretKey,
  })
}

const createCheckoutSessionSchema = z.object({
  invoiceId: z.string().uuid(),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
})

/**
 * POST /api/billing/checkout-session
 * Create a Stripe Checkout session for invoice payment
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const validated = createCheckoutSessionSchema.parse(body)

    // Fetch the invoice
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: validated.invoiceId,
        tenantId: session.user.tenantId,
      },
      include: {
        customer: true,
        tenant: true,
      },
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    // Check if invoice is already paid
    if (invoice.status === 'paid') {
      return NextResponse.json(
        { error: 'Invoice is already paid' },
        { status: 400 }
      )
    }

    // Calculate remaining amount (in cents)
    const remainingAmount = invoice.totalAmount - (invoice.paidAmount || 0)

    if (remainingAmount <= 0) {
      return NextResponse.json(
        { error: 'No remaining balance to pay' },
        { status: 400 }
      )
    }

    // Create checkout session via Stripe
    const stripeClient = getStripeClient()
    const result = await stripeClient.createCheckoutSession({
      invoiceId: invoice.id,
      amount: remainingAmount / 100, // Convert from cents to major currency unit
      currency: 'CZK',
      description: `Faktura ${invoice.invoiceNumber}`,
      returnUrl: validated.successUrl,
      cancelUrl: validated.cancelUrl,
      metadata: {
        tenantId: session.user.tenantId,
        invoiceNumber: invoice.invoiceNumber,
        customerId: invoice.customerId || undefined,
      },
    })

    if (!result.success || !result.gatewayUrl) {
      return NextResponse.json(
        { error: result.error || 'Failed to create checkout session' },
        { status: 500 }
      )
    }

    // Create payment record in database
    await prisma.invoicePayment.create({
      data: {
        tenantId: session.user.tenantId,
        invoiceId: invoice.id,
        amount: remainingAmount,
        currency: 'CZK',
        method: 'STRIPE',
        status: 'PENDING',
        gatewayPaymentId: result.gatewayPaymentId,
      },
    })

    return NextResponse.json({
      success: true,
      sessionId: result.paymentId,
      checkoutUrl: result.gatewayUrl,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      )
    }

    console.error('POST /api/billing/checkout-session error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
