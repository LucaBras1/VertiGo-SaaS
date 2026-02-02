import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { verifyWebhookSignature } from '@/lib/stripe'
import { sendDepositPaymentEmail, sendInvoicePaymentEmail } from '@/lib/email'


// Force dynamic to avoid build-time Prisma proxy issues
export const dynamic = 'force-dynamic'
/**
 * Handle gig deposit payment
 */
async function handleDepositPayment(
  session: Stripe.Checkout.Session,
  metadata: Record<string, string>
) {
  const { gigId, tenantId } = metadata

  if (!gigId || !tenantId) {
    console.error('Missing metadata in deposit payment:', session.id)
    return
  }

  // Fetch gig with tenant
  const gig = await prisma.gig.findFirst({
    where: { id: gigId, tenantId },
    include: { tenant: true },
  })

  if (!gig) {
    console.error('Gig not found for deposit payment:', gigId)
    return
  }

  // Update gig deposit status
  await prisma.gig.update({
    where: { id: gigId },
    data: { depositPaid: true },
  })

  // Send confirmation email if client email exists
  if (gig.clientEmail) {
    const amountPaid = session.amount_total ? session.amount_total / 100 : 0

    await sendDepositPaymentEmail({
      to: gig.clientEmail,
      clientName: gig.clientName || 'Vážený zákazníku',
      gigTitle: gig.title,
      amount: amountPaid.toLocaleString('cs-CZ'),
      bandName: gig.tenant.bandName || gig.tenant.name,
    })
  }

  console.log(`Deposit payment processed: gig ${gigId}`)
}

/**
 * Handle invoice payment
 */
async function handleInvoicePayment(
  session: Stripe.Checkout.Session,
  metadata: Record<string, string>
) {
  const { invoiceId, customerId, tenantId } = metadata

  if (!invoiceId || !tenantId) {
    console.error('Missing metadata in invoice payment:', session.id)
    return
  }

  const amountPaid = session.amount_total ? session.amount_total / 100 : 0

  // Fetch invoice with customer and tenant
  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, tenantId },
    include: {
      customer: true,
      tenant: true,
    },
  })

  if (!invoice) {
    console.error('Invoice not found for payment:', invoiceId)
    return
  }

  // Calculate new paid amount
  const newPaidAmount = invoice.paidAmount + (amountPaid * 100) // Convert to cents
  const isFullyPaid = newPaidAmount >= invoice.totalAmount

  // Update invoice status
  await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      status: isFullyPaid ? 'paid' : invoice.status,
      paidDate: isFullyPaid ? new Date() : invoice.paidDate,
      paidAmount: newPaidAmount,
    },
  })

  // Create payment record
  await prisma.invoicePayment.create({
    data: {
      tenantId,
      invoiceId,
      amount: amountPaid,
      currency: 'CZK',
      method: 'STRIPE',
      status: 'COMPLETED',
      gatewayProvider: 'stripe',
      gatewayPaymentId: session.payment_intent as string,
      processedAt: new Date(),
      completedAt: new Date(),
      metadata: {
        checkoutSessionId: session.id,
        customerEmail: session.customer_email,
      },
    },
  })

  // Send confirmation email
  if (invoice.customer.email) {
    await sendInvoicePaymentEmail({
      to: invoice.customer.email,
      clientName: `${invoice.customer.firstName} ${invoice.customer.lastName}`,
      invoiceNumber: invoice.invoiceNumber,
      amount: amountPaid.toLocaleString('cs-CZ'),
      bandName: invoice.tenant.bandName || invoice.tenant.name,
    })
  }

  console.log(`Invoice payment processed: ${invoiceId}, amount ${amountPaid}`)
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
      const paymentType = metadata.type

      try {
        if (paymentType === 'deposit') {
          await handleDepositPayment(session, metadata)
        } else if (paymentType === 'invoice') {
          await handleInvoicePayment(session, metadata)
        } else {
          console.error('Unknown payment type:', paymentType)
        }
      } catch (err) {
        console.error('Error processing checkout.session.completed:', err)
      }
      break
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      const metadata = paymentIntent.metadata || {}

      console.log(`Payment failed: ${paymentIntent.id}`, {
        type: metadata.type,
        gigId: metadata.gigId,
        invoiceId: metadata.invoiceId,
        error: paymentIntent.last_payment_error?.message,
      })
      break
    }

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}
