import Stripe from 'stripe';
import type { PaymentIntent, PaymentResult } from '../../../types/payment';

export interface StripeClientConfig {
  secretKey: string;
  webhookSecret?: string;
}

export class StripeClient {
  private stripe: Stripe;
  private webhookSecret?: string;

  constructor(config: StripeClientConfig) {
    this.stripe = new Stripe(config.secretKey, {
      apiVersion: '2024-12-18.acacia' as Stripe.LatestApiVersion,
    });
    this.webhookSecret = config.webhookSecret;
  }

  /**
   * Create payment intent
   */
  async createPaymentIntent(intent: PaymentIntent): Promise<PaymentResult> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(intent.amount * 100), // Convert to cents
        currency: intent.currency.toLowerCase(),
        metadata: {
          invoiceId: intent.invoiceId,
          ...intent.metadata,
        },
        description: intent.description,
      });

      return {
        success: true,
        paymentId: paymentIntent.id,
        status: this.mapStripeStatus(paymentIntent.status),
        gatewayPaymentId: paymentIntent.id,
        metadata: {
          clientSecret: paymentIntent.client_secret,
        },
      };
    } catch (error) {
      console.error('Stripe payment intent error:', error);
      return {
        success: false,
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Create checkout session (hosted payment page)
   */
  async createCheckoutSession(intent: PaymentIntent): Promise<PaymentResult> {
    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: intent.currency.toLowerCase(),
              product_data: {
                name: `Invoice Payment`,
                description: intent.description,
              },
              unit_amount: Math.round(intent.amount * 100),
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: intent.returnUrl || 'https://example.com/success',
        cancel_url: intent.cancelUrl || 'https://example.com/cancel',
        metadata: {
          invoiceId: intent.invoiceId,
          ...intent.metadata,
        },
      });

      return {
        success: true,
        paymentId: session.id,
        status: 'PENDING',
        gatewayPaymentId: session.id,
        gatewayUrl: session.url || undefined,
        metadata: {
          sessionId: session.id,
        },
      };
    } catch (error) {
      console.error('Stripe checkout session error:', error);
      return {
        success: false,
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Retrieve payment intent
   */
  async getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    return await this.stripe.paymentIntents.retrieve(paymentIntentId);
  }

  /**
   * Refund payment
   */
  async refundPayment(
    paymentIntentId: string,
    amount?: number
  ): Promise<{ success: boolean; refundId?: string; error?: string }> {
    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount ? Math.round(amount * 100) : undefined,
      });

      return {
        success: true,
        refundId: refund.id,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(
    payload: string | Buffer,
    signature: string
  ): Stripe.Event | null {
    if (!this.webhookSecret) {
      throw new Error('Webhook secret not configured');
    }

    try {
      return this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.webhookSecret
      );
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      return null;
    }
  }

  /**
   * Map Stripe payment status to our PaymentStatus
   */
  private mapStripeStatus(stripeStatus: string): any {
    const statusMap: Record<string, string> = {
      'requires_payment_method': 'PENDING',
      'requires_confirmation': 'PENDING',
      'requires_action': 'PENDING',
      'processing': 'PROCESSING',
      'succeeded': 'COMPLETED',
      'canceled': 'CANCELLED',
      'requires_capture': 'PENDING',
    };

    return statusMap[stripeStatus] || 'PENDING';
  }

  /**
   * Create customer
   */
  async createCustomer(
    email: string,
    name?: string,
    metadata?: Record<string, string>
  ): Promise<Stripe.Customer> {
    return await this.stripe.customers.create({
      email,
      name,
      metadata,
    });
  }

  /**
   * Get customer
   */
  async getCustomer(customerId: string): Promise<Stripe.Customer> {
    return await this.stripe.customers.retrieve(customerId) as Stripe.Customer;
  }
}
