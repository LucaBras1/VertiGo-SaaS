import { z } from 'zod';
import { CurrencySchema } from './currency';

// Expense categories
export const EXPENSE_CATEGORIES = [
  'OFFICE_SUPPLIES',
  'EQUIPMENT',
  'TRAVEL',
  'MEALS',
  'ENTERTAINMENT',
  'MARKETING',
  'SOFTWARE',
  'SUBSCRIPTIONS',
  'UTILITIES',
  'RENT',
  'INSURANCE',
  'PROFESSIONAL_SERVICES',
  'TRAINING',
  'OTHER',
] as const;

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];

export const ExpenseCategorySchema = z.enum(EXPENSE_CATEGORIES);

// Expense statuses
export const EXPENSE_STATUSES = [
  'DRAFT',
  'PENDING',
  'APPROVED',
  'REJECTED',
  'REIMBURSED',
] as const;

export type ExpenseStatus = typeof EXPENSE_STATUSES[number];

export const ExpenseStatusSchema = z.enum(EXPENSE_STATUSES);

// Expense
export const ExpenseSchema = z.object({
  id: z.string(),
  tenantId: z.string(),

  // Basic info
  description: z.string(),
  category: ExpenseCategorySchema,
  amount: z.number().positive(),
  currency: CurrencySchema,

  // Date
  date: z.date(),

  // Vendor
  vendor: z.string().optional(),

  // Receipt
  receiptUrl: z.string().url().optional(),
  receiptOcrData: z.record(z.any()).optional(), // OCR extracted data

  // Tax
  taxAmount: z.number().optional(),
  isTaxDeductible: z.boolean().default(false),

  // Status
  status: ExpenseStatusSchema,

  // Approval
  approvedBy: z.string().optional(),
  approvedAt: z.date().optional(),
  rejectedReason: z.string().optional(),

  // Reimbursement
  reimbursedAt: z.date().optional(),
  reimbursedAmount: z.number().optional(),

  // Notes
  notes: z.string().optional(),

  // Metadata
  metadata: z.record(z.any()).optional(),

  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Expense = z.infer<typeof ExpenseSchema>;

// OCR result from receipt
export const ReceiptOcrResultSchema = z.object({
  vendor: z.string().optional(),
  date: z.date().optional(),
  totalAmount: z.number().optional(),
  currency: z.string().optional(),
  taxAmount: z.number().optional(),
  items: z.array(z.object({
    description: z.string(),
    quantity: z.number().optional(),
    unitPrice: z.number().optional(),
    total: z.number(),
  })).optional(),
  confidence: z.number().min(0).max(1),
  rawText: z.string().optional(),
});

export type ReceiptOcrResult = z.infer<typeof ReceiptOcrResultSchema>;

// Create expense input
export const CreateExpenseInputSchema = ExpenseSchema.omit({
  id: true,
  status: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  status: ExpenseStatusSchema.optional().default('DRAFT'),
});

export type CreateExpenseInput = z.infer<typeof CreateExpenseInputSchema>;

// Expense filter
export const ExpenseFilterSchema = z.object({
  tenantId: z.string(),
  status: ExpenseStatusSchema.optional(),
  category: ExpenseCategorySchema.optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  minAmount: z.number().optional(),
  maxAmount: z.number().optional(),
});

export type ExpenseFilter = z.infer<typeof ExpenseFilterSchema>;
