import { z } from 'zod';
import { CurrencySchema } from './currency';

// Bank providers
export const BANK_PROVIDERS = [
  'FIO', // Fio banka (CZ)
  'WISE', // Wise (international)
  'REVOLUT', // Revolut (international)
  'PLAID', // Plaid (US/EU)
  'NORDIGEN', // Nordigen / GoCardless (EU)
  'MANUAL', // Manual entry
] as const;

export type BankProvider = typeof BANK_PROVIDERS[number];

export const BankProviderSchema = z.enum(BANK_PROVIDERS);

// Bank account
export const BankAccountSchema = z.object({
  id: z.string(),
  tenantId: z.string(),

  // Bank details
  accountName: z.string(),
  accountNumber: z.string(),
  bankCode: z.string().optional(), // For CZ banks
  iban: z.string().optional(),
  swift: z.string().optional(),

  // Provider
  provider: BankProviderSchema,
  providerAccountId: z.string().optional(), // External account ID

  // Currency
  currency: CurrencySchema,

  // Balance (if synced)
  balance: z.number().optional(),
  balanceUpdatedAt: z.date().optional(),

  // Sync settings
  autoSync: z.boolean().default(false),
  lastSyncAt: z.date().optional(),
  syncFrequency: z.enum(['MANUAL', 'HOURLY', 'DAILY', 'WEEKLY']).default('MANUAL'),

  // API credentials (encrypted)
  credentials: z.record(z.any()).optional(),

  // Status
  isActive: z.boolean().default(true),

  // Metadata
  metadata: z.record(z.any()).optional(),

  createdAt: z.date(),
  updatedAt: z.date(),
});

export type BankAccount = z.infer<typeof BankAccountSchema>;

// Bank transaction
export const BankTransactionSchema = z.object({
  id: z.string(),
  bankAccountId: z.string(),
  tenantId: z.string(),

  // Transaction details
  transactionId: z.string(), // Bank's transaction ID
  date: z.date(),
  amount: z.number(),
  currency: CurrencySchema,

  // Type
  type: z.enum(['DEBIT', 'CREDIT']),

  // Counterparty
  counterpartyName: z.string().optional(),
  counterpartyAccount: z.string().optional(),
  counterpartyBankCode: z.string().optional(),

  // Description
  description: z.string().optional(),
  note: z.string().optional(),
  variableSymbol: z.string().optional(), // VS (CZ)
  constantSymbol: z.string().optional(), // KS (CZ)
  specificSymbol: z.string().optional(), // SS (CZ)

  // Reference
  reference: z.string().optional(),

  // Matching
  isMatched: z.boolean().default(false),
  matchedInvoiceId: z.string().optional(),
  matchedPaymentId: z.string().optional(),
  matchConfidence: z.number().min(0).max(1).optional(), // AI confidence score

  // AI suggestions
  aiSuggestions: z.array(z.object({
    invoiceId: z.string(),
    invoiceNumber: z.string(),
    confidence: z.number(),
    reason: z.string(),
  })).optional(),

  // Metadata
  metadata: z.record(z.any()).optional(),

  createdAt: z.date(),
  updatedAt: z.date(),
});

export type BankTransaction = z.infer<typeof BankTransactionSchema>;

// Bank sync result
export const BankSyncResultSchema = z.object({
  bankAccountId: z.string(),
  success: z.boolean(),
  transactionsImported: z.number(),
  transactionsMatched: z.number(),
  dateFrom: z.date(),
  dateTo: z.date(),
  error: z.string().optional(),
  timestamp: z.date(),
});

export type BankSyncResult = z.infer<typeof BankSyncResultSchema>;

// FIO bank specific types
export const FioTransactionSchema = z.object({
  column22: z.object({ // Transaction ID
    value: z.number(),
    name: z.string(),
    id: z.number(),
  }),
  column0: z.object({ // Date
    value: z.string(),
    name: z.string(),
    id: z.number(),
  }),
  column1: z.object({ // Amount
    value: z.number(),
    name: z.string(),
    id: z.number(),
  }),
  column14: z.object({ // Currency
    value: z.string(),
    name: z.string(),
    id: z.number(),
  }),
  column2: z.object({ // Counterparty account
    value: z.string().optional(),
    name: z.string(),
    id: z.number(),
  }).optional(),
  column10: z.object({ // Counterparty name
    value: z.string().optional(),
    name: z.string(),
    id: z.number(),
  }).optional(),
  column3: z.object({ // Bank code
    value: z.string().optional(),
    name: z.string(),
    id: z.number(),
  }).optional(),
  column16: z.object({ // Note/message
    value: z.string().optional(),
    name: z.string(),
    id: z.number(),
  }).optional(),
  column5: z.object({ // Variable symbol
    value: z.string().optional(),
    name: z.string(),
    id: z.number(),
  }).optional(),
  column6: z.object({ // Specific symbol
    value: z.string().optional(),
    name: z.string(),
    id: z.number(),
  }).optional(),
  column4: z.object({ // Constant symbol
    value: z.string().optional(),
    name: z.string(),
    id: z.number(),
  }).optional(),
});

export type FioTransaction = z.infer<typeof FioTransactionSchema>;

// Plaid transaction (simplified)
export const PlaidTransactionSchema = z.object({
  transaction_id: z.string(),
  account_id: z.string(),
  amount: z.number(),
  date: z.string(),
  name: z.string(),
  merchant_name: z.string().optional(),
  payment_channel: z.string(),
  pending: z.boolean(),
  category: z.array(z.string()).optional(),
  location: z.object({
    address: z.string().optional(),
    city: z.string().optional(),
    region: z.string().optional(),
    postal_code: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
});

export type PlaidTransaction = z.infer<typeof PlaidTransactionSchema>;
