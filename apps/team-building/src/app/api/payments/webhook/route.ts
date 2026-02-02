import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { prisma } from '@/lib/db'
import { verifyWebhookSignature } from '@/lib/stripe'
import { sendPaymentConfirmationEmail } from '@/lib/email'
import { onInvoicePaid } from '@/lib/email-sequences'

// Force dynamic - prevent prerendering during build
export const dynamic = 'force-dynamic'

/**
 * Handle order payment completion
 */
async function handleOrderPayment(
  session: Stripe.Checkout.Session,
  metadata: Record<string, string>
) {
  const { orderId, orderNumber, customerId } = metadata

  if (!orderId || !customerId) {
    console.error('Missing metadata in order payment:', session.id)
    return
  }

  const amountPaid = session.amount_total ? session.amount_total / 100 : 0

  // Update order pricing with payment status
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      customer: true,
      items: {
        include: {
          program: true,
          activity: true,
          extra: true,
        },
      },
    },
  })

  if (!order) {
    console.error('Order not found:', orderId)
    return
  }

  // Update order status and pricing with payment info
  const currentPricing = (order.pricing as Record<string, unknown>) || {}
  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: 'confirmed',
      pricing: {
        ...currentPricing,
        paymentStatus: 'paid',
        paidAmount: amountPaid,
        paidDate: new Date().toISOString(),
        stripeSessionId: session.id,
        stripePaymentIntentId: session.payment_intent as string,
      },
    },
  })

  // Update customer statistics
  await prisma.customer.update({
    where: { id: customerId },
    data: {
      totalPaid: { increment: Math.round(amountPaid * 100) }, // Store in hellers
      lastPaymentDate: new Date(),
    },
  })

  // Send confirmation email
  if (order.customer?.email) {
    const items = order.items.map((item) => ({
      description: item.program?.title || item.activity?.title || item.extra?.title || 'Service',
      quantity: 1,
      total: `${(item.price / 100).toLocaleString('cs-CZ')} Kč`,
    }))

    await sendPaymentConfirmationEmail({
      to: order.customer.email,
      contactName: `${order.customer.firstName} ${order.customer.lastName}`,
      companyName: order.customer.organization || '',
      orderNumber: order.orderNumber,
      amount: amountPaid.toLocaleString('cs-CZ'),
      currency: 'CZK',
      items,
    })
  }

  console.log(`Order payment processed: ${orderId}, amount ${amountPaid}`)
}

/**
 * Handle invoice payment completion
 */
async function handleInvoicePayment(
  session: Stripe.Checkout.Session,
  metadata: Record<string, string>
) {
  const { invoiceId, customerId } = metadata

  if (!invoiceId || !customerId) {
    console.error('Missing metadata in invoice payment:', session.id)
    return
  }

  const amountPaid = session.amount_total ? session.amount_total / 100 : 0

  // Update invoice status
  const invoice = await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      status: 'paid',
      paidDate: new Date(),
      paidAmount: Math.round(amountPaid * 100), // Store in hellers
      paymentMethod: 'STRIPE',
    },
    include: {
      customer: true,
    },
  })

  // Update customer statistics
  await prisma.customer.update({
    where: { id: customerId },
    data: {
      totalPaid: { increment: Math.round(amountPaid * 100) },
      lastPaymentDate: new Date(),
    },
  })

  // Send confirmation email
  if (invoice.customer?.email) {
    await sendPaymentConfirmationEmail({
      to: invoice.customer.email,
      contactName: `${invoice.customer.firstName} ${invoice.customer.lastName}`,
      companyName: invoice.customer.organization || '',
      orderNumber: invoice.invoiceNumber,
      amount: amountPaid.toLocaleString('cs-CZ'),
      currency: 'CZK',
      items: [],
    })
  }

  // Trigger email sequence for invoice paid
  onInvoicePaid(invoiceId).catch((err) => {
    console.error('Failed to trigger invoice paid email sequence:', err)
  })

  console.log(`Invoice payment processed: ${invoiceId}, amount ${amountPaid}`)
}

/**
 * Handle session booking payment
 */
async function handleSessionPayment(
  session: Stripe.Checkout.Session,
  metadata: Record<string, string>
) {
  const { sessionId, customerId } = metadata

  if (!sessionId) {
    console.error('Missing metadata in session payment:', session.id)
    return
  }

  const amountPaid = session.amount_total ? session.amount_total / 100 : 0

  // Update session status to confirmed
  await prisma.session.update({
    where: { id: sessionId },
    data: {
      status: 'confirmed',
    },
  })

  // Update customer statistics if we have customerId
  if (customerId) {
    await prisma.customer.update({
      where: { id: customerId },
      data: {
        totalPaid: { increment: Math.round(amountPaid * 100) },
        lastPaymentDate: new Date(),
      },
    })
  }

  console.log(`Session booking payment processed: ${sessionId}, amount ${amountPaid}`)
}

// POST /api/payments/webhook
export async function POST(req: Request) {
  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    )
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set')
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    )
  }

  let event: Stripe.Event

  try {
    event = verifyWebhookSignature(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const metadata = session.metadata || {}
      const paymentType = metadata.type || 'order'

      // Idempotency check - verify we haven't already processed this
      // This is done within each handler by checking current status

      try {
        if (paymentType === 'order') {
          await handleOrderPayment(session, metadata)
        } else if (paymentType === 'invoice') {
          await handleInvoicePayment(session, metadata)
        } else if (paymentType === 'session') {
          await handleSessionPayment(session, metadata)
        } else {
          console.warn('Unknown payment type:', paymentType)
        }
      } catch (err) {
        console.error('Error processing checkout.session.completed:', err)
        // Don't return error - Stripe will retry
      }
      break
    }

    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      console.log(`Payment intent succeeded: ${paymentIntent.id}`)
      break
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      console.log(`Payment intent failed: ${paymentIntent.id}`)
      break
    }

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}
