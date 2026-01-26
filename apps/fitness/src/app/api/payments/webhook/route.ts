import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { verifyWebhookSignature } from '@/lib/stripe'
import { sendEmail } from '@/lib/email'

/**
 * Handle package purchase payment
 */
async function handlePackagePayment(
  session: Stripe.Checkout.Session,
  metadata: Record<string, string>
) {
  const { packageId, clientId, tenantId, credits } = metadata

  if (!packageId || !clientId || !tenantId || !credits) {
    console.error('Missing metadata in package payment:', session.id)
    return
  }

  // Add credits to client
  await prisma.client.update({
    where: { id: clientId },
    data: {
      creditsRemaining: {
        increment: parseInt(credits, 10),
      },
    },
  })

  // Create order record
  const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`

  await prisma.order.create({
    data: {
      tenantId,
      clientId,
      orderNumber,
      status: 'completed',
      items: [
        {
          type: 'package',
          packageId,
          name: session.line_items?.data[0]?.description || 'Package',
          quantity: 1,
          price: session.amount_total ? session.amount_total / 100 : 0,
        },
      ],
      subtotal: session.amount_total ? session.amount_total / 100 : 0,
      total: session.amount_total ? session.amount_total / 100 : 0,
      paymentMethod: 'STRIPE',
      paymentStatus: 'paid',
      paidAmount: session.amount_total ? session.amount_total / 100 : 0,
      paidDate: new Date(),
    },
  })

  // Send confirmation email
  await sendPackagePaymentEmail(clientId, session, credits)

  console.log(`Package payment processed: client ${clientId}, credits ${credits}`)
}

/**
 * Handle invoice payment
 */
async function handleInvoicePayment(
  session: Stripe.Checkout.Session,
  metadata: Record<string, string>
) {
  const { invoiceId, clientId, tenantId } = metadata

  if (!invoiceId || !clientId || !tenantId) {
    console.error('Missing metadata in invoice payment:', session.id)
    return
  }

  const amountPaid = session.amount_total ? session.amount_total / 100 : 0

  // Update invoice status
  await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      status: 'paid',
      paidDate: new Date(),
      paymentMethod: 'STRIPE',
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
  await sendInvoicePaymentEmail(invoiceId, clientId, amountPaid)

  console.log(`Invoice payment processed: ${invoiceId}, amount ${amountPaid}`)
}

/**
 * Handle training session payment
 */
async function handleSessionPayment(
  session: Stripe.Checkout.Session,
  metadata: Record<string, string>
) {
  const { sessionId, clientId, tenantId } = metadata

  if (!sessionId || !clientId || !tenantId) {
    console.error('Missing metadata in session payment:', session.id)
    return
  }

  const amountPaid = session.amount_total ? session.amount_total / 100 : 0

  // Mark session as paid
  await prisma.session.update({
    where: { id: sessionId },
    data: {
      paid: true,
      price: amountPaid,
    },
  })

  // Send confirmation email
  await sendSessionPaymentEmail(sessionId, clientId, amountPaid)

  console.log(`Session payment processed: ${sessionId}, amount ${amountPaid}`)
}

/**
 * Send package payment confirmation email
 */
async function sendPackagePaymentEmail(
  clientId: string,
  session: Stripe.Checkout.Session,
  credits: string
) {
  try {
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: { name: true, email: true },
    })

    if (client?.email) {
      const amount = session.amount_total
        ? (session.amount_total / 100).toLocaleString('cs-CZ')
        : '0'

      await sendEmail({
        to: client.email,
        subject: 'Potvrzení platby - FitAdmin',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">Platba přijata</h1>
              </div>
              <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px;">
                <p style="font-size: 16px;">Dobrý den, <strong>${client.name}</strong>!</p>
                <p>Vaše platba za balíček kreditů byla úspěšně zpracována.</p>
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10B981;">
                  <p style="margin: 5px 0;"><strong>Částka:</strong> ${amount} Kč</p>
                  <p style="margin: 5px 0;"><strong>Kredity přidány:</strong> ${credits}</p>
                  <p style="margin: 5px 0;"><strong>Datum:</strong> ${new Date().toLocaleDateString('cs-CZ')}</p>
                </div>
                <p style="color: #666; font-size: 14px;">Děkujeme za Vaši platbu!</p>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                <p style="color: #9ca3af; font-size: 12px; text-align: center;">FitAdmin - Správa fitness studia</p>
              </div>
            </body>
          </html>
        `,
      })
    }
  } catch (emailError) {
    console.error('Failed to send package payment email:', emailError)
  }
}

/**
 * Send invoice payment confirmation email
 */
async function sendInvoicePaymentEmail(
  invoiceId: string,
  clientId: string,
  amount: number
) {
  try {
    const [invoice, client] = await Promise.all([
      prisma.invoice.findUnique({
        where: { id: invoiceId },
        select: { invoiceNumber: true },
      }),
      prisma.client.findUnique({
        where: { id: clientId },
        select: { name: true, email: true },
      }),
    ])

    if (client?.email && invoice) {
      await sendEmail({
        to: client.email,
        subject: `Potvrzení platby faktury ${invoice.invoiceNumber}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">Platba faktury potvrzena</h1>
              </div>
              <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px;">
                <p style="font-size: 16px;">Dobrý den, <strong>${client.name}</strong>!</p>
                <p>Vaše platba faktury byla úspěšně přijata.</p>
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10B981;">
                  <p style="margin: 5px 0;"><strong>Faktura:</strong> ${invoice.invoiceNumber}</p>
                  <p style="margin: 5px 0;"><strong>Částka:</strong> ${amount.toLocaleString('cs-CZ')} Kč</p>
                  <p style="margin: 5px 0;"><strong>Datum:</strong> ${new Date().toLocaleDateString('cs-CZ')}</p>
                </div>
                <p style="color: #666; font-size: 14px;">Děkujeme za Vaši platbu!</p>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                <p style="color: #9ca3af; font-size: 12px; text-align: center;">FitAdmin - Správa fitness studia</p>
              </div>
            </body>
          </html>
        `,
      })
    }
  } catch (emailError) {
    console.error('Failed to send invoice payment email:', emailError)
  }
}

/**
 * Send training session payment confirmation email
 */
async function sendSessionPaymentEmail(
  sessionId: string,
  clientId: string,
  amount: number
) {
  try {
    const [session, client] = await Promise.all([
      prisma.session.findUnique({
        where: { id: sessionId },
        select: { scheduledAt: true },
      }),
      prisma.client.findUnique({
        where: { id: clientId },
        select: { name: true, email: true },
      }),
    ])

    if (client?.email && session) {
      const sessionDate = new Date(session.scheduledAt).toLocaleDateString('cs-CZ')

      await sendEmail({
        to: client.email,
        subject: 'Potvrzení platby tréninku',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">Platba tréninku potvrzena</h1>
              </div>
              <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px;">
                <p style="font-size: 16px;">Dobrý den, <strong>${client.name}</strong>!</p>
                <p>Vaše platba za trénink byla úspěšně přijata.</p>
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10B981;">
                  <p style="margin: 5px 0;"><strong>Datum tréninku:</strong> ${sessionDate}</p>
                  <p style="margin: 5px 0;"><strong>Částka:</strong> ${amount.toLocaleString('cs-CZ')} Kč</p>
                  <p style="margin: 5px 0;"><strong>Datum platby:</strong> ${new Date().toLocaleDateString('cs-CZ')}</p>
                </div>
                <p style="color: #666; font-size: 14px;">Děkujeme za Vaši platbu!</p>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                <p style="color: #9ca3af; font-size: 12px; text-align: center;">FitAdmin - Správa fitness studia</p>
              </div>
            </body>
          </html>
        `,
      })
    }
  } catch (emailError) {
    console.error('Failed to send session payment email:', emailError)
  }
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
      const paymentType = metadata.type || 'package'

      try {
        if (paymentType === 'package') {
          await handlePackagePayment(session, metadata)
        } else if (paymentType === 'invoice') {
          await handleInvoicePayment(session, metadata)
        } else if (paymentType === 'session') {
          await handleSessionPayment(session, metadata)
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
      console.log(`Payment failed: ${paymentIntent.id}`)
      // Could send notification email here
      break
    }

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}

// Disable body parsing for webhook (Stripe needs raw body)
export const config = {
  api: {
    bodyParser: false,
  },
}
