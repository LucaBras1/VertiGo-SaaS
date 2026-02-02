/**
 * @vertigo/stripe - Webhook Handler
 * Factory for creating Stripe webhook handlers
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { stripe } from '../client'
import type { WebhookHandlers, StripeEvent } from '../types'

/**
 * Verify and parse webhook event
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  webhookSecret: string
): StripeEvent {
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret)
}

/**
 * Create a webhook handler for Next.js API routes
 *
 * @example
 * // In app/api/webhooks/stripe/route.ts
 * import { createWebhookHandler } from '@vertigo/stripe'
 *
 * const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!
 *
 * export const POST = createWebhookHandler(webhookSecret, {
 *   'checkout.session.completed': async (event) => {
 *     const session = event.data.object
 *     // Handle successful checkout
 *   },
 *   'payment_intent.succeeded': async (event) => {
 *     const paymentIntent = event.data.object
 *     // Handle successful payment
 *   },
 * })
 */
export function createWebhookHandler(
  webhookSecret: string,
  handlers: WebhookHandlers
) {
  return async function handler(request: NextRequest): Promise<NextResponse> {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      console.error('[Stripe Webhook] Missing stripe-signature header')
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      )
    }

    let event: StripeEvent

    try {
      event = verifyWebhookSignature(body, signature, webhookSecret)
    } catch (err) {
      console.error('[Stripe Webhook] Signature verification failed:', err)
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      )
    }

    console.log(`[Stripe Webhook] Received event: ${event.type}`)

    try {
      const eventHandler = handlers[event.type as keyof WebhookHandlers]
      if (eventHandler) {
        await eventHandler(event as any)
        console.log(`[Stripe Webhook] Successfully processed: ${event.type}`)
      } else {
        console.log(`[Stripe Webhook] No handler for event type: ${event.type}`)
      }

      return NextResponse.json({ received: true })
    } catch (err) {
      console.error(`[Stripe Webhook] Error processing ${event.type}:`, err)
      return NextResponse.json(
        { error: 'Webhook handler error' },
        { status: 500 }
      )
    }
  }
}

/**
 * Simple webhook handler that just verifies signature and returns event
 * Use this if you need more control over the response
 */
export async function parseWebhookEvent(
  request: NextRequest,
  webhookSecret: string
): Promise<{ event: StripeEvent | null; error: string | null }> {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return { event: null, error: 'Missing stripe-signature header' }
  }

  try {
    const event = verifyWebhookSignature(body, signature, webhookSecret)
    return { event, error: null }
  } catch (err) {
    return { event: null, error: 'Webhook signature verification failed' }
  }
}
