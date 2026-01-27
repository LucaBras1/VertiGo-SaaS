import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { StripeClient } from '@vertigo/billing/integrations'
import { z } from 'zod'

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

// Supported currencies
const SUPPORTED_CURRENCIES = ['CZK', 'EUR', 'USD', 'GBP', 'PLN', 'HUF', 'CHF', 'SEK', 'DKK', 'NOK', 'CAD', 'AUD', 'JPY', 'CNY'] as const
type SupportedCurrency = typeof SUPPORTED_CURRENCIES[number]

const createPaymentIntentSchema = z.object({
  invoiceId: z.string().uuid(),
  amount: z.number().positive().optional(), // If not provided, use invoice total
  currency: z.enum(SUPPORTED_CURRENCIES).default('CZK'),
  description: z.string().optional(),
})

/**
 * POST /api/billing/payment-intent
 * Create a payment intent for an invoice
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const validated = createPaymentIntentSchema.parse(body)

    // Fetch the invoice
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: validated.invoiceId,
        tenantId: session.user.tenantId,
      },
      include: {
        customer: true,
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
    const paymentAmount = validated.amount
      ? Math.round(validated.amount * 100)
      : remainingAmount

    if (paymentAmount <= 0) {
      return NextResponse.json(
        { error: 'Invalid payment amount' },
        { status: 400 }
      )
    }

    // Create payment intent via Stripe
    const stripeClient = getStripeClient()
    const result = await stripeClient.createPaymentIntent({
      invoiceId: invoice.id,
      amount: paymentAmount / 100, // StripeClient expects amount in major currency unit
      currency: validated.currency,
      description: validated.description || `Payment for Invoice ${invoice.invoiceNumber}`,
      metadata: {
        tenantId: session.user.tenantId,
        invoiceNumber: invoice.invoiceNumber,
        customerId: invoice.customerId || undefined,
      },
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to create payment intent' },
        { status: 500 }
      )
    }

    // Create payment record in database
    await prisma.invoicePayment.create({
      data: {
        tenantId: session.user.tenantId,
        invoiceId: invoice.id,
        amount: paymentAmount,
        currency: validated.currency.toUpperCase(),
        method: 'STRIPE',
        status: 'PENDING',
        gatewayPaymentId: result.gatewayPaymentId,
      },
    })

    return NextResponse.json({
      success: true,
      paymentIntentId: result.paymentId,
      clientSecret: result.metadata?.clientSecret,
      amount: paymentAmount,
      currency: validated.currency,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      )
    }

    console.error('POST /api/billing/payment-intent error:', error)
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/billing/payment-intent?invoiceId=xxx
 * Get payment intent status for an invoice
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const invoiceId = searchParams.get('invoiceId')

    if (!invoiceId) {
      return NextResponse.json(
        { error: 'invoiceId is required' },
        { status: 400 }
      )
    }

    // Find pending payment intents for this invoice
    const payments = await prisma.invoicePayment.findMany({
      where: {
        invoiceId,
        method: 'STRIPE',
        invoice: {
          tenantId: session.user.tenantId,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      payments: payments.map((p) => ({
        id: p.id,
        amount: p.amount,
        currency: p.currency,
        status: p.status,
        gatewayPaymentId: p.gatewayPaymentId,
        createdAt: p.createdAt,
        completedAt: p.completedAt,
      })),
    })
  } catch (error) {
    console.error('GET /api/billing/payment-intent error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payment intents' },
      { status: 500 }
    )
  }
}
