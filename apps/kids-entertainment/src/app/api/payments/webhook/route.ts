/**
 * Stripe Webhook Handler
 * POST /api/payments/webhook - Handle Stripe webhook events
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyWebhookSignature, formatAmountForDisplay } from '@/lib/stripe'
import { createInvoiceFromOrder, generateInvoicePDF } from '@/lib/services/invoices'
import { sendPaymentReceiptEmail } from '@/lib/email'
import type Stripe from 'stripe'

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text()
    const signature = request.headers.get('stripe-signature')

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
      event = verifyWebhookSignature(payload, signature, webhookSecret)
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

        // Get metadata
        const orderId = session.metadata?.orderId
        const paymentType = session.metadata?.type || 'deposit'

        if (!orderId) {
          console.warn('Checkout completed without orderId in metadata')
          break
        }

        // Get current order to merge pricing data
        const currentOrder = await prisma.order.findUnique({
          where: { id: orderId },
        })

        const currentPricing = (currentOrder?.pricing as Record<string, unknown>) || {}

        // Update pricing with payment info
        const updatedPricing: Record<string, unknown> = {
          ...currentPricing,
          stripeSessionId: session.id,
          paymentIntentId: session.payment_intent as string,
        }

        let newStatus = currentOrder?.status || 'new'

        if (paymentType === 'deposit') {
          updatedPricing.deposit = session.amount_total
          updatedPricing.depositPaidAt = new Date().toISOString()
          newStatus = 'confirmed' // Deposit paid = confirmed
        } else if (paymentType === 'full_payment') {
          updatedPricing.paidAt = new Date().toISOString()
          newStatus = 'completed' // Full payment = completed
        }

        await prisma.order.update({
          where: { id: orderId },
          data: {
            status: newStatus,
            pricing: updatedPricing as any,
          },
        })

        // Also update party status if deposit is paid
        if (currentOrder?.linkedPartyId && paymentType === 'deposit') {
          await prisma.party.update({
            where: { id: currentOrder.linkedPartyId },
            data: { status: 'confirmed' },
          })
        }

        console.log(`Payment processed for order ${orderId} (${paymentType})`)

        // Generate invoice and send email
        try {
          await handlePaymentSuccess({
            orderId,
            session,
            paymentType: paymentType as 'deposit' | 'full_payment',
          })
        } catch (invoiceError) {
          console.error('Invoice/email error (non-fatal):', invoiceError)
        }
        break
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session
        const orderId = session.metadata?.orderId

        if (orderId) {
          // Mark order as payment expired
          await prisma.order.update({
            where: { id: orderId },
            data: {
              status: 'cancelled',
            },
          })
          console.log(`Checkout session expired for order ${orderId}`)
        }
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.warn('Payment failed:', paymentIntent.id, paymentIntent.last_payment_error?.message)
        break
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge
        const paymentIntentId = charge.payment_intent as string

        if (paymentIntentId) {
          // Find order by checking pricing JSON
          const orders = await prisma.order.findMany({
            take: 100,
            orderBy: { createdAt: 'desc' },
          })

          const order = orders.find((o) => {
            const pricing = o.pricing as Record<string, unknown> | null
            return pricing?.paymentIntentId === paymentIntentId
          })

          if (order) {
            const currentPricing = (order.pricing as Record<string, unknown>) || {}
            await prisma.order.update({
              where: { id: order.id },
              data: {
                status: charge.amount_refunded === charge.amount ? 'cancelled' : 'confirmed',
                pricing: {
                  ...currentPricing,
                  refundedAt: new Date().toISOString(),
                  refundAmount: charge.amount_refunded,
                },
              },
            })
            console.log(`Refund processed for order ${order.id}`)
          }
        }
        break
      }

      default:
        // Unhandled event type
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      {
        error: 'Webhook handler failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// Handle successful payment - create invoice and send email
async function handlePaymentSuccess({
  orderId,
  session,
  paymentType,
}: {
  orderId: string
  session: Stripe.Checkout.Session
  paymentType: 'deposit' | 'full_payment'
}) {
  // 1. Fetch order with customer and party details
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      customer: true,
      linkedParty: true,
    },
  })

  if (!order || !order.customer) {
    console.warn('Order or customer not found for invoice generation:', orderId)
    return
  }

  // 2. Create Invoice record
  const invoice = await createInvoiceFromOrder(orderId, paymentType)
  console.log(`Invoice created: ${invoice.invoiceNumber}`)

  // 3. Generate PDF
  const pdfBuffer = await generateInvoicePDF(invoice.id)

  // 4. Format amount for display
  const amount = formatAmountForDisplay(session.amount_total || 0, 'CZK')

  // 5. Format party date if available
  let partyDate: string | undefined
  if (order.linkedParty?.date) {
    partyDate = order.linkedParty.date.toLocaleDateString('cs-CZ', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  // 6. Send payment receipt email with PDF attachment
  const emailResult = await sendPaymentReceiptEmail({
    to: order.customer.email,
    parentName: `${order.customer.firstName} ${order.customer.lastName}`,
    invoiceNumber: invoice.invoiceNumber,
    amount,
    paymentType,
    partyDate,
    pdfBuffer,
  })

  if (emailResult.success) {
    console.log(`Payment receipt email sent: ${emailResult.messageId}`)

    // 7. Update invoice status to SENT
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        invoiceStatus: 'SENT',
        status: 'sent',
      },
    })
  } else {
    console.error('Failed to send payment receipt email:', emailResult.error)
  }
}
