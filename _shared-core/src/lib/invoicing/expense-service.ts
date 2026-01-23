/**
 * Expense Service
 *
 * CRUD operations for expense tracking
 */

import { prisma } from '@/lib/prisma'
import {
  CreateExpenseData,
  Expense,
  ExpenseFilters,
  PaginatedResponse,
  ExpenseCategory,
  ExpenseStatus,
} from '@/types/invoicing'
import { generateExpenseNumber } from './number-generator'

// ============================================================================
// CREATE
// ============================================================================

/**
 * Create a new expense
 */
export async function createExpense(data: CreateExpenseData): Promise<Expense> {
  const expenseNumber = await generateExpenseNumber(
    data.expenseDate ? new Date(data.expenseDate) : new Date()
  )

  const expense = await prisma.expense.create({
    data: {
      expenseNumber,
      description: data.description,
      category: data.category,
      subcategory: data.subcategory,
      tags: data.tags || [],

      amount: data.amount,
      vatRate: data.vatRate || 0,
      vatAmount: data.vatAmount || 0,
      totalAmount: data.totalAmount,
      currency: data.currency || 'CZK',

      expenseDate: new Date(data.expenseDate),
      status: 'PENDING',

      supplierName: data.supplierName,
      supplierIco: data.supplierIco,
      supplierDic: data.supplierDic,

      documentNumber: data.documentNumber,
      documentUrl: data.documentUrl,
      documentType: data.documentType,

      invoiceId: data.invoiceId,
      orderId: data.orderId,

      paymentMethod: data.paymentMethod,
      bankAccount: data.bankAccount,

      notes: data.notes,
      internalNote: data.internalNote,
    },
  })

  return expense as unknown as Expense
}

// ============================================================================
// READ
// ============================================================================

/**
 * Get expense by ID
 */
export async function getExpense(id: string): Promise<Expense | null> {
  const expense = await prisma.expense.findUnique({
    where: { id },
    include: {
      invoice: {
        select: {
          id: true,
          invoiceNumber: true,
        },
      },
    },
  })

  return expense as unknown as Expense | null
}

/**
 * List expenses with pagination and filters
 */
export async function listExpenses(
  filters: ExpenseFilters = {},
  page = 1,
  pageSize = 25
): Promise<PaginatedResponse<Expense>> {
  const where: Record<string, unknown> = {}

  // Search
  if (filters.search) {
    where.OR = [
      { expenseNumber: { contains: filters.search } },
      { description: { contains: filters.search } },
      { supplierName: { contains: filters.search } },
      { documentNumber: { contains: filters.search } },
    ]
  }

  // Status filter
  if (filters.status && filters.status.length > 0) {
    where.status = { in: filters.status }
  }

  // Category filter
  if (filters.category && filters.category.length > 0) {
    where.category = { in: filters.category }
  }

  // Date range
  if (filters.dateFrom || filters.dateTo) {
    where.expenseDate = {}
    if (filters.dateFrom) {
      (where.expenseDate as Record<string, unknown>).gte = new Date(filters.dateFrom)
    }
    if (filters.dateTo) {
      (where.expenseDate as Record<string, unknown>).lte = new Date(filters.dateTo)
    }
  }

  // Amount range
  if (filters.amountMin !== undefined || filters.amountMax !== undefined) {
    where.totalAmount = {}
    if (filters.amountMin !== undefined) {
      (where.totalAmount as Record<string, unknown>).gte = filters.amountMin
    }
    if (filters.amountMax !== undefined) {
      (where.totalAmount as Record<string, unknown>).lte = filters.amountMax
    }
  }

  // Invoice filter
  if (filters.invoiceId) {
    where.invoiceId = filters.invoiceId
  }

  const total = await prisma.expense.count({ where })

  const expenses = await prisma.expense.findMany({
    where,
    include: {
      invoice: {
        select: {
          id: true,
          invoiceNumber: true,
        },
      },
    },
    orderBy: { expenseDate: 'desc' },
    skip: (page - 1) * pageSize,
    take: pageSize,
  })

  return {
    data: expenses as unknown as Expense[],
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}

// ============================================================================
// UPDATE
// ============================================================================

/**
 * Update an expense
 */
export async function updateExpense(
  id: string,
  data: Partial<CreateExpenseData> & { status?: ExpenseStatus; paidDate?: Date | string }
): Promise<Expense> {
  const updateData: Record<string, unknown> = {}

  if (data.description !== undefined) updateData.description = data.description
  if (data.category !== undefined) updateData.category = data.category
  if (data.subcategory !== undefined) updateData.subcategory = data.subcategory
  if (data.tags !== undefined) updateData.tags = data.tags

  if (data.amount !== undefined) updateData.amount = data.amount
  if (data.vatRate !== undefined) updateData.vatRate = data.vatRate
  if (data.vatAmount !== undefined) updateData.vatAmount = data.vatAmount
  if (data.totalAmount !== undefined) updateData.totalAmount = data.totalAmount
  if (data.currency !== undefined) updateData.currency = data.currency

  if (data.expenseDate !== undefined) updateData.expenseDate = new Date(data.expenseDate)
  if (data.paidDate !== undefined) updateData.paidDate = new Date(data.paidDate)
  if (data.status !== undefined) updateData.status = data.status

  if (data.supplierName !== undefined) updateData.supplierName = data.supplierName
  if (data.supplierIco !== undefined) updateData.supplierIco = data.supplierIco
  if (data.supplierDic !== undefined) updateData.supplierDic = data.supplierDic

  if (data.documentNumber !== undefined) updateData.documentNumber = data.documentNumber
  if (data.documentUrl !== undefined) updateData.documentUrl = data.documentUrl
  if (data.documentType !== undefined) updateData.documentType = data.documentType

  if (data.invoiceId !== undefined) updateData.invoiceId = data.invoiceId
  if (data.orderId !== undefined) updateData.orderId = data.orderId

  if (data.paymentMethod !== undefined) updateData.paymentMethod = data.paymentMethod
  if (data.bankAccount !== undefined) updateData.bankAccount = data.bankAccount

  if (data.notes !== undefined) updateData.notes = data.notes
  if (data.internalNote !== undefined) updateData.internalNote = data.internalNote

  const expense = await prisma.expense.update({
    where: { id },
    data: updateData,
  })

  return expense as unknown as Expense
}

/**
 * Mark expense as paid
 */
export async function markExpenseAsPaid(
  id: string,
  paidDate: Date = new Date()
): Promise<void> {
  await prisma.expense.update({
    where: { id },
    data: {
      status: 'PAID',
      paidDate,
    },
  })
}

// ============================================================================
// DELETE
// ============================================================================

/**
 * Delete an expense
 */
export async function deleteExpense(id: string): Promise<void> {
  await prisma.expense.delete({ where: { id } })
}

// ============================================================================
// STATISTICS
// ============================================================================

/**
 * Get expense summary by category
 */
export async function getExpenseSummaryByCategory(
  year?: number
): Promise<{ category: ExpenseCategory; total: number; count: number }[]> {
  const whereYear = year
    ? {
        expenseDate: {
          gte: new Date(year, 0, 1),
          lt: new Date(year + 1, 0, 1),
        },
      }
    : {}

  const expenses = await prisma.expense.groupBy({
    by: ['category'],
    where: {
      ...whereYear,
      status: { not: 'CANCELLED' },
    },
    _sum: {
      totalAmount: true,
    },
    _count: {
      id: true,
    },
  })

  return expenses.map(e => ({
    category: e.category as ExpenseCategory,
    total: e._sum.totalAmount || 0,
    count: e._count.id,
  }))
}

/**
 * Get total expenses for a period
 */
export async function getTotalExpenses(
  dateFrom?: Date,
  dateTo?: Date
): Promise<{ total: number; paid: number; pending: number }> {
  const where: Record<string, unknown> = {
    status: { not: 'CANCELLED' },
  }

  if (dateFrom || dateTo) {
    where.expenseDate = {}
    if (dateFrom) (where.expenseDate as Record<string, unknown>).gte = dateFrom
    if (dateTo) (where.expenseDate as Record<string, unknown>).lte = dateTo
  }

  const result = await prisma.expense.aggregate({
    where,
    _sum: {
      totalAmount: true,
    },
  })

  const paidResult = await prisma.expense.aggregate({
    where: { ...where, status: 'PAID' },
    _sum: {
      totalAmount: true,
    },
  })

  const total = result._sum.totalAmount || 0
  const paid = paidResult._sum.totalAmount || 0

  return {
    total,
    paid,
    pending: total - paid,
  }
}
