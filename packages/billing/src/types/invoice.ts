import { z } from 'zod';
import { CurrencySchema } from './currency';
import { TaxConfigSchema } from './tax';

// Invoice statuses
export const INVOICE_STATUSES = ['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED', 'REFUNDED'] as const;
export type InvoiceStatus = typeof INVOICE_STATUSES[number];

export const InvoiceStatusSchema = z.enum(INVOICE_STATUSES);

// Invoice types
export const INVOICE_TYPES = [
  'STANDARD', // Normal invoice
  'PROFORMA', // Pro-forma invoice (not legally binding)
  'CREDIT_NOTE', // Credit note (refund)
  'DEPOSIT', // Deposit invoice
  'FINAL', // Final invoice after deposit
  'RECURRING', // Recurring invoice (subscription)
] as const;

export type InvoiceType = typeof INVOICE_TYPES[number];

export const InvoiceTypeSchema = z.enum(INVOICE_TYPES);

// Invoice line item
export const InvoiceLineItemSchema = z.object({
  id: z.string(),
  description: z.string(),
  quantity: z.number().positive(),
  unitPrice: z.number(),
  discount: z.number().min(0).max(100).default(0), // Percentage
  taxRate: z.number().min(0).max(100).default(0), // Percentage
  subtotal: z.number(),
  taxAmount: z.number(),
  total: z.number(),
  metadata: z.record(z.any()).optional(),
});

export type InvoiceLineItem = z.infer<typeof InvoiceLineItemSchema>;

// Payment terms
export const PAYMENT_TERMS = [
  'IMMEDIATE', // Due immediately
  'NET_7', // Due in 7 days
  'NET_14', // Due in 14 days
  'NET_30', // Due in 30 days
  'NET_60', // Due in 60 days
  'NET_90', // Due in 90 days
  'CUSTOM', // Custom due date
] as const;

export type PaymentTerm = typeof PAYMENT_TERMS[number];

export const PaymentTermSchema = z.enum(PAYMENT_TERMS);

// Billing address
export const BillingAddressSchema = z.object({
  name: z.string(),
  company: z.string().optional(),
  street: z.string(),
  city: z.string(),
  postalCode: z.string(),
  country: z.string(),
  vatId: z.string().optional(), // DIČ
  companyId: z.string().optional(), // IČO
  email: z.string().email().optional(),
  phone: z.string().optional(),
});

export type BillingAddress = z.infer<typeof BillingAddressSchema>;

// Invoice data
export const InvoiceSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  invoiceNumber: z.string(),
  type: InvoiceTypeSchema,
  status: InvoiceStatusSchema,

  // Dates
  issueDate: z.date(),
  dueDate: z.date(),
  paidAt: z.date().optional(),

  // Parties
  seller: BillingAddressSchema,
  buyer: BillingAddressSchema,

  // Line items
  items: z.array(InvoiceLineItemSchema),

  // Amounts
  subtotal: z.number(),
  discount: z.number().default(0),
  taxAmount: z.number(),
  total: z.number(),
  currency: CurrencySchema,

  // Tax configuration
  taxConfig: TaxConfigSchema.optional(),

  // Payment
  paymentTerm: PaymentTermSchema,
  paymentMethod: z.string().optional(),
  paymentReference: z.string().optional(),

  // Documents
  pdfUrl: z.string().url().optional(),

  // Notes
  notes: z.string().optional(),
  internalNotes: z.string().optional(),

  // Related
  orderId: z.string().optional(),
  relatedInvoiceId: z.string().optional(), // For credit notes

  // Metadata
  metadata: z.record(z.any()).optional(),

  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Invoice = z.infer<typeof InvoiceSchema>;

// Create invoice input
export const CreateInvoiceInputSchema = InvoiceSchema.omit({
  id: true,
  invoiceNumber: true,
  status: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  status: InvoiceStatusSchema.optional().default('DRAFT'),
  autoGenerateNumber: z.boolean().default(true),
});

export type CreateInvoiceInput = z.infer<typeof CreateInvoiceInputSchema>;

// Update invoice input
export const UpdateInvoiceInputSchema = InvoiceSchema.partial().extend({
  id: z.string(),
});

export type UpdateInvoiceInput = z.infer<typeof UpdateInvoiceInputSchema>;

// Invoice numbering format
export const InvoiceNumberFormatSchema = z.object({
  prefix: z.string().default('INV'), // e.g., "INV", "FV"
  separator: z.string().default('-'),
  yearFormat: z.enum(['YYYY', 'YY', 'NONE']).default('YYYY'),
  sequenceFormat: z.enum(['1', '01', '001', '0001', '00001']).default('0001'),
  suffix: z.string().optional(),
  example: z.string().optional(), // e.g., "INV-2024-0001"
});

export type InvoiceNumberFormat = z.infer<typeof InvoiceNumberFormatSchema>;

// Invoice filtering
export const InvoiceFilterSchema = z.object({
  tenantId: z.string(),
  status: InvoiceStatusSchema.optional(),
  type: InvoiceTypeSchema.optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  search: z.string().optional(), // Search in invoice number, buyer name, etc.
  orderId: z.string().optional(),
});

export type InvoiceFilter = z.infer<typeof InvoiceFilterSchema>;
