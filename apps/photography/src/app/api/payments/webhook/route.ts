import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { verifyWebhookSignature, formatAmount } from '@/lib/stripe'
import { sendPaymentConfirmationEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

// Disable body parsing - we need raw body for signature verification
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET not configured')
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
    }

    // Verify webhook signature
    let event
    try {
      event = verifyWebhookSignature(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as {
          id: string
          payment_intent: string | { id: string } | null
          metadata: {
            tenantId?: string
            packageId?: string
            invoiceId?: string
            paymentType?: string
            clientName?: string
          } | null
          amount_total: number | null
          currency: string | null
          customer_email: string | null
        }

        const metadata = session.metadata || {}
        const { tenantId, packageId, invoiceId, paymentType, clientName } = metadata

        // Update payment record
        const payment = await prisma.payment.updateMany({
          where: { stripeSessionId: session.id },
          data: {
            status: 'PAID',
            paidAt: new Date(),
            stripePaymentId:
              typeof session.payment_intent === 'string'
                ? session.payment_intent
                : session.payment_intent?.id,
          },
        })

        if (payment.count === 0) {
          console.warn('No payment record found for session:', session.id)
        }

        // Update package payment status if applicable
        if (packageId && tenantId) {
          if (paymentType === 'deposit') {
            await prisma.package.update({
              where: { id: packageId },
              data: {
                paymentStatus: 'DEPOSIT_PAID',
                depositPaidAt: new Date(),
                depositSessionId: session.id,
              },
            })
          } else if (paymentType === 'balance' || paymentType === 'full') {
            await prisma.package.update({
              where: { id: packageId },
              data: {
                paymentStatus: 'PAID',
                balancePaidAt: new Date(),
                balanceSessionId: session.id,
              },
            })
          }

          // Get package details for email
          const pkg = await prisma.package.findUnique({
            where: { id: packageId },
            include: { client: true },
          })

          // Send confirmation email
          if (pkg?.client?.email) {
            await sendPaymentConfirmationEmail({
              to: pkg.client.email,
              clientName: pkg.client.name,
              amount: formatAmount(session.amount_total || 0, session.currency || 'CZK'),
              paymentType: (paymentType as 'deposit' | 'balance' | 'full' | 'invoice') || 'full',
              packageTitle: pkg.title,
            })
          }
        }

        // Update invoice status if applicable
        if (invoiceId && tenantId) {
          await prisma.invoice.update({
            where: { id: invoiceId },
            data: {
              status: 'PAID',
              paidAt: new Date(),
            },
          })

          // Get invoice details for email
          const invoice = await prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: { client: true },
          })

          // Send confirmation email
          if (invoice?.client?.email) {
            await sendPaymentConfirmationEmail({
              to: invoice.client.email,
              clientName: invoice.client.name,
              amount: formatAmount(session.amount_total || 0, session.currency || 'CZK'),
              paymentType: 'invoice',
            })
          }
        }

        break
      }

      case 'checkout.session.expired': {
        const session = event.data.object as { id: string }

        await prisma.payment.updateMany({
          where: { stripeSessionId: session.id },
          data: { status: 'FAILED' },
        })

        break
      }

      case 'charge.refunded': {
        const charge = event.data.object as {
          payment_intent: string | null
          amount_refunded: number
        }

        if (charge.payment_intent) {
          await prisma.payment.updateMany({
            where: { stripePaymentId: charge.payment_intent },
            data: {
              status: 'REFUNDED',
              refundedAt: new Date(),
              refundAmount: charge.amount_refunded,
            },
          })
        }

        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
