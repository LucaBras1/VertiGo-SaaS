import { z } from 'zod';
import { CurrencySchema } from './currency';

// Payment methods
export const PAYMENT_METHODS = [
  'CASH',
  'BANK_TRANSFER',
  'CARD',
  'STRIPE',
  'PAYPAL',
  'GOPAY',
  'CRYPTO',
  'OTHER',
] as const;

export type PaymentMethod = typeof PAYMENT_METHODS[number];

export const PaymentMethodSchema = z.enum(PAYMENT_METHODS);

// Payment statuses
export const PAYMENT_STATUSES = [
  'PENDING',
  'PROCESSING',
  'COMPLETED',
  'FAILED',
  'CANCELLED',
  'REFUNDED',
] as const;

export type PaymentStatus = typeof PAYMENT_STATUSES[number];

export const PaymentStatusSchema = z.enum(PAYMENT_STATUSES);

// Payment gateway providers
export const PAYMENT_GATEWAY_PROVIDERS = [
  'STRIPE',
  'PAYPAL',
  'GOPAY',
  'ADYEN',
  'SQUARE',
] as const;

export type PaymentGatewayProvider = typeof PAYMENT_GATEWAY_PROVIDERS[number];

export const PaymentGatewayProviderSchema = z.enum(PAYMENT_GATEWAY_PROVIDERS);

// Crypto payment providers
export const CRYPTO_PROVIDERS = [
  'COINBASE_COMMERCE',
  'BTCPAY_SERVER',
  'CIRCLE',
  'COINGATE',
] as const;

export type CryptoProvider = typeof CRYPTO_PROVIDERS[number];

export const CryptoProviderSchema = z.enum(CRYPTO_PROVIDERS);

// Payment
export const PaymentSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  invoiceId: z.string(),

  // Payment details
  amount: z.number().positive(),
  currency: CurrencySchema,
  method: PaymentMethodSchema,
  status: PaymentStatusSchema,

  // Gateway info
  gatewayProvider: PaymentGatewayProviderSchema.optional(),
  gatewayPaymentId: z.string().optional(), // External payment ID
  gatewayFee: z.number().optional(), // Gateway fee amount

  // Transaction details
  transactionId: z.string().optional(),
  reference: z.string().optional(),

  // Dates
  processedAt: z.date().optional(),
  completedAt: z.date().optional(),

  // Metadata
  metadata: z.record(z.any()).optional(),

  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Payment = z.infer<typeof PaymentSchema>;

// Create payment input
export const CreatePaymentInputSchema = PaymentSchema.omit({
  id: true,
  status: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  status: PaymentStatusSchema.optional().default('PENDING'),
});

export type CreatePaymentInput = z.infer<typeof CreatePaymentInputSchema>;

// Payment intent (for gateway integration)
export const PaymentIntentSchema = z.object({
  amount: z.number().positive(),
  currency: CurrencySchema,
  invoiceId: z.string(),
  customerId: z.string().optional(),
  description: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  returnUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

export type PaymentIntent = z.infer<typeof PaymentIntentSchema>;

// Payment result (from gateway)
export const PaymentResultSchema = z.object({
  success: z.boolean(),
  paymentId: z.string().optional(),
  status: PaymentStatusSchema,
  gatewayPaymentId: z.string().optional(),
  gatewayUrl: z.string().url().optional(), // Redirect URL for checkout
  error: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export type PaymentResult = z.infer<typeof PaymentResultSchema>;

// Refund
export const RefundSchema = z.object({
  id: z.string(),
  paymentId: z.string(),
  amount: z.number().positive(),
  currency: CurrencySchema,
  reason: z.string().optional(),
  status: z.enum(['PENDING', 'COMPLETED', 'FAILED']),
  gatewayRefundId: z.string().optional(),
  createdAt: z.date(),
  completedAt: z.date().optional(),
});

export type Refund = z.infer<typeof RefundSchema>;

// Payment webhook event
export const PaymentWebhookEventSchema = z.object({
  provider: PaymentGatewayProviderSchema.or(CryptoProviderSchema),
  eventType: z.string(), // e.g., "payment.completed", "payment.failed"
  paymentId: z.string(),
  status: PaymentStatusSchema,
  amount: z.number().optional(),
  currency: CurrencySchema.optional(),
  metadata: z.record(z.any()).optional(),
  rawPayload: z.record(z.any()), // Original webhook payload
  signature: z.string().optional(), // Webhook signature for verification
  timestamp: z.date(),
});

export type PaymentWebhookEvent = z.infer<typeof PaymentWebhookEventSchema>;
