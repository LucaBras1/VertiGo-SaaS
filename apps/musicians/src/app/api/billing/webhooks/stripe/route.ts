import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { prisma } from '@/lib/db'
import { StripeClient } from '@vertigo/billing/integrations'
import type Stripe from 'stripe'

// Initialize Stripe client with webhook secret
function getStripeClient(): StripeClient {
  const secretKey = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured')
  }

  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not configured')
  }

  return new StripeClient({
    secretKey,
    webhookSecret,
  })
}

// Stripe webhook handler for payment processing
export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      console.error('Stripe webhook: Missing stripe-signature header')
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      )
    }

    // Verify webhook signature using @vertigo/billing StripeClient
    const stripeClient = getStripeClient()
    const event = stripeClient.verifyWebhookSignature(body, signature)

    if (!event) {
      console.error('Stripe webhook: Invalid signature')
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      )
    }

    // Handle verified events
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object as Stripe.PaymentIntent)
        break

      case 'charge.refunded':
        await handleRefund(event.data.object as Stripe.Charge)
        break

      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
        break

      default:
        console.log(`Stripe webhook: Unhandled event type ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Stripe webhook error:', error)

    // Check if it's a configuration error
    if (error instanceof Error && error.message.includes('not configured')) {
      return NextResponse.json(
        { error: 'Webhook configuration error' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const { id, amount, metadata } = paymentIntent

  if (!metadata?.invoiceId) {
    console.warn('Stripe webhook: Payment without invoice ID:', id)
    return
  }

  console.log(`Stripe webhook: Processing successful payment ${id} for invoice ${metadata.invoiceId}`)

  await prisma.$transaction(async (tx) => {
    // Update payment record
    const payment = await tx.invoicePayment.findFirst({
      where: {
        gatewayPaymentId: id,
      },
    })

    if (payment) {
      await tx.invoicePayment.update({
        where: { id: payment.id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      })
    } else {
      // Get tenantId from invoice
      const invoiceForTenant = await tx.invoice.findUnique({
        where: { id: metadata.invoiceId },
        select: { tenantId: true },
      })

      if (invoiceForTenant) {
        // Create payment record if it doesn't exist (e.g., from checkout session)
        await tx.invoicePayment.create({
          data: {
            tenantId: invoiceForTenant.tenantId,
            invoiceId: metadata.invoiceId,
            amount: amount, // Amount in cents
            currency: paymentIntent.currency.toUpperCase(),
            method: 'STRIPE',
            status: 'COMPLETED',
            gatewayPaymentId: id,
            completedAt: new Date(),
          },
        })
      }
    }

    // Update invoice
    const invoice = await tx.invoice.findUnique({
      where: { id: metadata.invoiceId },
    })

    if (invoice) {
      const paidAmount = amount // Keep in cents for consistency
      const newTotal = (invoice.paidAmount || 0) + paidAmount

      await tx.invoice.update({
        where: { id: invoice.id },
        data: {
          paidAmount: newTotal,
          status: newTotal >= invoice.totalAmount ? 'paid' : 'sent',
          paidDate: newTotal >= invoice.totalAmount ? new Date() : null,
        },
      })

      console.log(`Stripe webhook: Invoice ${invoice.id} updated - paidAmount: ${newTotal}, status: ${newTotal >= invoice.totalAmount ? 'paid' : 'sent'}`)
    }
  })
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  const { id, metadata } = paymentIntent

  console.log(`Stripe webhook: Payment failed ${id}`)

  await prisma.invoicePayment.updateMany({
    where: {
      gatewayPaymentId: id,
    },
    data: {
      status: 'FAILED',
    },
  })
}

async function handleRefund(charge: Stripe.Charge) {
  const { payment_intent, amount_refunded } = charge

  if (!payment_intent || typeof payment_intent !== 'string') {
    console.warn('Stripe webhook: Refund without payment intent')
    return
  }

  console.log(`Stripe webhook: Processing refund for payment ${payment_intent}`)

  await prisma.invoicePayment.updateMany({
    where: {
      gatewayPaymentId: payment_intent,
    },
    data: {
      status: 'REFUNDED',
    },
  })
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const { id, payment_intent, metadata, amount_total } = session

  if (!metadata?.invoiceId) {
    console.warn('Stripe webhook: Checkout session without invoice ID:', id)
    return
  }

  console.log(`Stripe webhook: Checkout session completed ${id} for invoice ${metadata.invoiceId}`)

  // The payment_intent.succeeded event will handle the actual payment recording
  // But we can update the invoice status here as well if needed

  if (payment_intent && typeof payment_intent === 'string') {
    // Create or update payment record
    const existing = await prisma.invoicePayment.findFirst({
      where: { gatewayPaymentId: payment_intent },
    })

    if (!existing && amount_total) {
      // Get tenantId from invoice
      const invoice = await prisma.invoice.findUnique({
        where: { id: metadata.invoiceId },
        select: { tenantId: true },
      })

      if (invoice) {
        await prisma.invoicePayment.create({
          data: {
            tenantId: invoice.tenantId,
            invoiceId: metadata.invoiceId,
            amount: amount_total,
            currency: session.currency?.toUpperCase() || 'CZK',
            method: 'STRIPE',
            status: 'PROCESSING',
            gatewayPaymentId: payment_intent,
          },
        })
      }
    }
  }
}
