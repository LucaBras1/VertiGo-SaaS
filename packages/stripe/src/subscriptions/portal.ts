/**
 * @vertigo/stripe - Customer Portal
 * Create customer portal sessions for self-service management
 */

import { stripe } from '../client'
import type { CustomerPortalOptions, CustomerPortalResult } from './types'

/**
 * Create a customer portal session
 * The customer portal allows users to:
 * - Update payment methods
 * - View invoices and billing history
 * - Update subscription (if configured)
 * - Cancel subscription (if configured)
 *
 * @example
 * const portal = await createCustomerPortalSession({
 *   customerId: 'cus_xxx',
 *   returnUrl: 'https://app.example.com/dashboard/billing',
 * })
 * // Redirect user to portal.url
 */
export async function createCustomerPortalSession(
  options: CustomerPortalOptions
): Promise<CustomerPortalResult> {
  const { customerId, returnUrl, flowType, subscriptionId } = options

  const sessionParams: Parameters<typeof stripe.billingPortal.sessions.create>[0] = {
    customer: customerId,
    return_url: returnUrl,
  }

  // Add flow data for specific flows
  if (flowType) {
    switch (flowType) {
      case 'payment_method_update':
        sessionParams.flow_data = {
          type: 'payment_method_update',
        }
        break
      case 'subscription_cancel':
        if (subscriptionId) {
          sessionParams.flow_data = {
            type: 'subscription_cancel',
            subscription_cancel: {
              subscription: subscriptionId,
            },
          }
        }
        break
      case 'subscription_update':
        if (subscriptionId) {
          sessionParams.flow_data = {
            type: 'subscription_update',
            subscription_update: {
              subscription: subscriptionId,
            },
          }
        }
        break
    }
  }

  const session = await stripe.billingPortal.sessions.create(sessionParams)

  return {
    url: session.url,
  }
}

/**
 * Create a portal configuration (usually done once in Stripe Dashboard)
 * This defines what features are available in the customer portal
 *
 * @example
 * // This is typically configured in Stripe Dashboard, but can be done via API
 * const config = await createPortalConfiguration({
 *   businessName: 'VertiGo SaaS',
 *   features: {
 *     payment_method_update: true,
 *     subscription_cancel: true,
 *     subscription_update: true,
 *     invoice_history: true,
 *   },
 * })
 */
export async function createPortalConfiguration(options: {
  businessName: string
  features: {
    payment_method_update?: boolean
    subscription_cancel?: boolean
    subscription_update?: boolean
    invoice_history?: boolean
  }
  privacyPolicyUrl?: string
  termsOfServiceUrl?: string
}) {
  const { businessName, features, privacyPolicyUrl, termsOfServiceUrl } = options

  const config = await stripe.billingPortal.configurations.create({
    business_profile: {
      headline: `Manage your ${businessName} subscription`,
      privacy_policy_url: privacyPolicyUrl,
      terms_of_service_url: termsOfServiceUrl,
    },
    features: {
      payment_method_update: {
        enabled: features.payment_method_update ?? true,
      },
      subscription_cancel: {
        enabled: features.subscription_cancel ?? true,
        mode: 'at_period_end',
        cancellation_reason: {
          enabled: true,
          options: [
            'too_expensive',
            'missing_features',
            'switched_service',
            'unused',
            'customer_service',
            'too_complex',
            'low_quality',
            'other',
          ],
        },
      },
      invoice_history: {
        enabled: features.invoice_history ?? true,
      },
      customer_update: {
        enabled: true,
        allowed_updates: ['email', 'address', 'phone', 'tax_id'],
      },
    },
  })

  return config
}

/**
 * Get customer's default payment method
 */
export async function getCustomerPaymentMethod(customerId: string) {
  const customer = await stripe.customers.retrieve(customerId, {
    expand: ['invoice_settings.default_payment_method'],
  })

  if (customer.deleted) {
    return null
  }

  const defaultPaymentMethod = customer.invoice_settings?.default_payment_method

  if (!defaultPaymentMethod || typeof defaultPaymentMethod === 'string') {
    return null
  }

  return {
    id: defaultPaymentMethod.id,
    type: defaultPaymentMethod.type,
    card: defaultPaymentMethod.card
      ? {
          brand: defaultPaymentMethod.card.brand,
          last4: defaultPaymentMethod.card.last4,
          expMonth: defaultPaymentMethod.card.exp_month,
          expYear: defaultPaymentMethod.card.exp_year,
        }
      : null,
  }
}

/**
 * List customer's payment methods
 */
export async function listCustomerPaymentMethods(
  customerId: string,
  type: 'card' | 'sepa_debit' | 'us_bank_account' = 'card'
) {
  const paymentMethods = await stripe.paymentMethods.list({
    customer: customerId,
    type,
  })

  return paymentMethods.data.map((pm) => ({
    id: pm.id,
    type: pm.type,
    card: pm.card
      ? {
          brand: pm.card.brand,
          last4: pm.card.last4,
          expMonth: pm.card.exp_month,
          expYear: pm.card.exp_year,
        }
      : null,
    isDefault: false, // Would need to compare with customer's default
  }))
}

/**
 * Set default payment method for a customer
 */
export async function setDefaultPaymentMethod(customerId: string, paymentMethodId: string) {
  const customer = await stripe.customers.update(customerId, {
    invoice_settings: {
      default_payment_method: paymentMethodId,
    },
  })

  return customer
}
