/**
 * Invoice Service
 *
 * CRUD operations and business logic for invoices
 */

import { prisma } from '@/lib/prisma'
import {
  CreateInvoiceData,
  UpdateInvoiceData,
  InvoiceWithRelations,
  InvoiceFilters,
  PaginatedResponse,
  InvoiceItem,
  calculateInvoiceTotals,
  toHellers,
  INVOICE_STATUS,
  InvoiceStatus,
  DocumentType,
} from '@/types/invoicing'
import { generateInvoiceNumber } from './number-generator'

// ============================================================================
// CREATE
// ============================================================================

/**
 * Create a new invoice
 */
export async function createInvoice(data: CreateInvoiceData): Promise<InvoiceWithRelations> {
  // Generate invoice number
  const { invoiceNumber, variableSymbol, numberSeriesId } = await generateInvoiceNumber({
    documentType: data.documentType || 'FAKTURA',
    numberSeriesId: data.numberSeriesId,
    date: data.issueDate ? new Date(data.issueDate) : new Date(),
  })

  // Calculate totals if not provided
  const items = data.items.map(item => ({
    ...item,
    unitPrice: typeof item.unitPrice === 'number' && item.unitPrice < 1000
      ? toHellers(item.unitPrice)
      : item.unitPrice,
  }))

  const totals = data.subtotal
    ? {
        subtotal: data.subtotal,
        vatAmount: data.vatAmount || 0,
        totalAmount: data.totalAmount || data.subtotal + (data.vatAmount || 0),
      }
    : calculateInvoiceTotals(
        items as InvoiceItem[],
        data.discount || 0,
        data.discountType || 'amount'
      )

  // Get customer snapshot
  const customer = await prisma.customer.findUnique({
    where: { id: data.customerId },
    select: {
      firstName: true,
      lastName: true,
      email: true,
      organization: true,
      billingInfo: true,
      address: true,
    },
  })

  // Get supplier snapshot from settings
  const settings = await prisma.invoicingSettings.findUnique({
    where: { id: 'singleton' },
  })

  const supplierSnapshot = settings ? {
    name: settings.supplierName,
    ico: settings.supplierIco,
    dic: settings.supplierDic,
    street: settings.supplierStreet,
    city: settings.supplierCity,
    zip: settings.supplierZip,
    country: settings.supplierCountry,
    email: settings.supplierEmail,
    phone: settings.supplierPhone,
    web: settings.supplierWeb,
    bankAccount: settings.bankAccountNumber,
    iban: settings.bankIban,
    bic: settings.bankBic,
  } : null

  // Create invoice
  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber,
      documentType: data.documentType || 'FAKTURA',
      invoiceStatus: 'DRAFT',
      status: 'draft',

      customerId: data.customerId,
      orderId: data.orderId,
      numberSeriesId,
      templateId: data.templateId,

      issueDate: data.issueDate ? new Date(data.issueDate) : new Date(),
      dueDate: new Date(data.dueDate),
      taxableSupplyDate: data.taxableSupplyDate ? new Date(data.taxableSupplyDate) : null,

      items: items as unknown as object,

      subtotal: totals.subtotal,
      vatRate: data.vatRate || 0,
      vatAmount: totals.vatAmount,
      totalAmount: totals.totalAmount,
      discount: data.discount || 0,
      discountType: data.discountType || 'amount',

      paymentMethod: data.paymentMethod || settings?.defaultPaymentMethod,
      bankAccount: data.bankAccount || settings?.bankAccountNumber,
      iban: data.iban || settings?.bankIban,
      variableSymbol: data.variableSymbol || variableSymbol,
      constantSymbol: data.constantSymbol,
      specificSymbol: data.specificSymbol,
      currency: data.currency || settings?.defaultCurrency || 'CZK',

      textBeforeItems: data.textBeforeItems,
      textAfterItems: data.textAfterItems,
      footerNote: data.footerNote,
      notes: data.notes,
      internalNote: data.internalNote,

      customerSnapshot: customer as unknown as object,
      supplierSnapshot: supplierSnapshot as unknown as object,
    },
    include: {
      customer: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          organization: true,
          billingInfo: true,
        },
      },
      order: {
        select: {
          id: true,
          orderNumber: true,
          eventName: true,
        },
      },
      numberSeries: {
        select: {
          id: true,
          name: true,
          prefix: true,
        },
      },
      template: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })

  return invoice as unknown as InvoiceWithRelations
}

// ============================================================================
// READ
// ============================================================================

/**
 * Get invoice by ID with all relations
 */
export async function getInvoice(id: string): Promise<InvoiceWithRelations | null> {
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      customer: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          organization: true,
          billingInfo: true,
        },
      },
      order: {
        select: {
          id: true,
          orderNumber: true,
          eventName: true,
        },
      },
      numberSeries: {
        select: {
          id: true,
          name: true,
          prefix: true,
        },
      },
      template: {
        select: {
          id: true,
          name: true,
        },
      },
      payments: true,
      expenses: true,
      parentInvoice: true,
      childInvoices: true,
    },
  })

  return invoice as unknown as InvoiceWithRelations | null
}

/**
 * Get invoice by invoice number
 */
export async function getInvoiceByNumber(invoiceNumber: string): Promise<InvoiceWithRelations | null> {
  const invoice = await prisma.invoice.findUnique({
    where: { invoiceNumber },
    include: {
      customer: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          organization: true,
          billingInfo: true,
        },
      },
      order: true,
      payments: true,
    },
  })

  return invoice as unknown as InvoiceWithRelations | null
}

/**
 * List invoices with pagination and filters
 */
export async function listInvoices(
  filters: InvoiceFilters = {},
  page = 1,
  pageSize = 25
): Promise<PaginatedResponse<InvoiceWithRelations>> {
  const where: Record<string, unknown> = {}

  // Search
  if (filters.search) {
    where.OR = [
      { invoiceNumber: { contains: filters.search } },
      { customer: { firstName: { contains: filters.search } } },
      { customer: { lastName: { contains: filters.search } } },
      { customer: { organization: { contains: filters.search } } },
      { customer: { email: { contains: filters.search } } },
    ]
  }

  // Status filter
  if (filters.status && filters.status.length > 0) {
    where.invoiceStatus = { in: filters.status }
  }

  // Document type filter
  if (filters.documentType && filters.documentType.length > 0) {
    where.documentType = { in: filters.documentType }
  }

  // Customer filter
  if (filters.customerId) {
    where.customerId = filters.customerId
  }

  // Date range filter
  if (filters.dateFrom || filters.dateTo) {
    where.issueDate = {}
    if (filters.dateFrom) {
      (where.issueDate as Record<string, unknown>).gte = new Date(filters.dateFrom)
    }
    if (filters.dateTo) {
      (where.issueDate as Record<string, unknown>).lte = new Date(filters.dateTo)
    }
  }

  // Amount range filter
  if (filters.amountMin !== undefined || filters.amountMax !== undefined) {
    where.totalAmount = {}
    if (filters.amountMin !== undefined) {
      (where.totalAmount as Record<string, unknown>).gte = filters.amountMin
    }
    if (filters.amountMax !== undefined) {
      (where.totalAmount as Record<string, unknown>).lte = filters.amountMax
    }
  }

  // Paid/unpaid filter
  if (filters.isPaid !== undefined) {
    if (filters.isPaid) {
      where.invoiceStatus = 'PAID'
    } else {
      where.invoiceStatus = { notIn: ['PAID', 'CANCELLED'] }
    }
  }

  // Overdue filter
  if (filters.isOverdue) {
    where.AND = [
      { invoiceStatus: { notIn: ['PAID', 'CANCELLED'] } },
      { dueDate: { lt: new Date() } },
    ]
  }

  // Get total count
  const total = await prisma.invoice.count({ where })

  // Get invoices
  const invoices = await prisma.invoice.findMany({
    where,
    include: {
      customer: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          organization: true,
          billingInfo: true,
        },
      },
      order: {
        select: {
          id: true,
          orderNumber: true,
          eventName: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * pageSize,
    take: pageSize,
  })

  return {
    data: invoices as unknown as InvoiceWithRelations[],
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
 * Update an invoice
 */
export async function updateInvoice(
  id: string,
  data: UpdateInvoiceData
): Promise<InvoiceWithRelations> {
  const updateData: Record<string, unknown> = {}

  // Update fields if provided
  if (data.documentType) updateData.documentType = data.documentType
  if (data.invoiceStatus) {
    updateData.invoiceStatus = data.invoiceStatus
    // Also update legacy status
    const statusMap: Record<InvoiceStatus, string> = {
      DRAFT: 'draft',
      SENT: 'sent',
      VIEWED: 'sent',
      PAID: 'paid',
      PARTIALLY_PAID: 'paid',
      OVERDUE: 'overdue',
      CANCELLED: 'cancelled',
      DISPUTED: 'overdue',
    }
    updateData.status = statusMap[data.invoiceStatus]
  }

  if (data.customerId) updateData.customerId = data.customerId
  if (data.orderId !== undefined) updateData.orderId = data.orderId
  if (data.templateId !== undefined) updateData.templateId = data.templateId

  if (data.issueDate) updateData.issueDate = new Date(data.issueDate)
  if (data.dueDate) updateData.dueDate = new Date(data.dueDate)
  if (data.taxableSupplyDate) updateData.taxableSupplyDate = new Date(data.taxableSupplyDate)

  if (data.items) updateData.items = data.items
  if (data.subtotal !== undefined) updateData.subtotal = data.subtotal
  if (data.vatRate !== undefined) updateData.vatRate = data.vatRate
  if (data.vatAmount !== undefined) updateData.vatAmount = data.vatAmount
  if (data.totalAmount !== undefined) updateData.totalAmount = data.totalAmount
  if (data.discount !== undefined) updateData.discount = data.discount
  if (data.discountType !== undefined) updateData.discountType = data.discountType

  if (data.paidAmount !== undefined) updateData.paidAmount = data.paidAmount
  if (data.paidDate) updateData.paidDate = new Date(data.paidDate)

  if (data.paymentMethod !== undefined) updateData.paymentMethod = data.paymentMethod
  if (data.bankAccount !== undefined) updateData.bankAccount = data.bankAccount
  if (data.iban !== undefined) updateData.iban = data.iban
  if (data.variableSymbol !== undefined) updateData.variableSymbol = data.variableSymbol
  if (data.currency !== undefined) updateData.currency = data.currency

  if (data.textBeforeItems !== undefined) updateData.textBeforeItems = data.textBeforeItems
  if (data.textAfterItems !== undefined) updateData.textAfterItems = data.textAfterItems
  if (data.footerNote !== undefined) updateData.footerNote = data.footerNote
  if (data.notes !== undefined) updateData.notes = data.notes
  if (data.internalNote !== undefined) updateData.internalNote = data.internalNote

  const invoice = await prisma.invoice.update({
    where: { id },
    data: updateData,
    include: {
      customer: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          organization: true,
          billingInfo: true,
        },
      },
      order: {
        select: {
          id: true,
          orderNumber: true,
          eventName: true,
        },
      },
      payments: true,
    },
  })

  return invoice as unknown as InvoiceWithRelations
}

/**
 * Mark invoice as sent
 */
export async function markInvoiceAsSent(id: string): Promise<void> {
  await prisma.invoice.update({
    where: { id },
    data: {
      invoiceStatus: 'SENT',
      status: 'sent',
      lastEmailSentAt: new Date(),
      emailSentCount: { increment: 1 },
    },
  })
}

/**
 * Mark invoice as paid
 */
export async function markInvoiceAsPaid(
  id: string,
  paidDate: Date = new Date(),
  paidAmount?: number
): Promise<void> {
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    select: { totalAmount: true },
  })

  if (!invoice) throw new Error('Invoice not found')

  const amount = paidAmount ?? invoice.totalAmount

  await prisma.invoice.update({
    where: { id },
    data: {
      invoiceStatus: amount >= invoice.totalAmount ? 'PAID' : 'PARTIALLY_PAID',
      status: 'paid',
      paidAmount: amount,
      paidDate,
    },
  })

  // Update customer stats
  const updatedInvoice = await prisma.invoice.findUnique({
    where: { id },
    select: { customerId: true },
  })

  if (updatedInvoice?.customerId) {
    await updateCustomerPaymentStats(updatedInvoice.customerId)
  }
}

/**
 * Cancel/storno invoice
 */
export async function cancelInvoice(id: string, reason?: string): Promise<void> {
  await prisma.invoice.update({
    where: { id },
    data: {
      invoiceStatus: 'CANCELLED',
      status: 'cancelled',
      internalNote: reason
        ? `Stornováno: ${reason}`
        : 'Stornováno',
    },
  })
}

// ============================================================================
// DELETE
// ============================================================================

/**
 * Delete invoice (only draft invoices can be deleted)
 */
export async function deleteInvoice(id: string): Promise<void> {
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    select: { invoiceStatus: true },
  })

  if (!invoice) throw new Error('Invoice not found')

  if (invoice.invoiceStatus !== 'DRAFT') {
    throw new Error('Only draft invoices can be deleted. Use cancel/storno for sent invoices.')
  }

  await prisma.invoice.delete({ where: { id } })
}

// ============================================================================
// DUPLICATE
// ============================================================================

/**
 * Duplicate an invoice (create copy as draft)
 */
export async function duplicateInvoice(id: string): Promise<InvoiceWithRelations> {
  const original = await prisma.invoice.findUnique({
    where: { id },
    include: {
      customer: true,
    },
  })

  if (!original) throw new Error('Invoice not found')

  // Create new invoice with copied data
  return createInvoice({
    documentType: original.documentType as DocumentType,
    customerId: original.customerId,
    orderId: original.orderId || undefined,
    templateId: original.templateId || undefined,

    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now

    items: original.items as unknown as InvoiceItem[],

    vatRate: original.vatRate || undefined,
    discount: original.discount || undefined,
    discountType: (original.discountType as 'amount' | 'percentage') || undefined,

    paymentMethod: original.paymentMethod || undefined,
    bankAccount: original.bankAccount || undefined,
    iban: original.iban || undefined,
    currency: original.currency,

    textBeforeItems: original.textBeforeItems || undefined,
    textAfterItems: original.textAfterItems || undefined,
    footerNote: original.footerNote || undefined,
    notes: original.notes || undefined,
    internalNote: `Kopie faktury ${original.invoiceNumber}`,
  })
}

// ============================================================================
// CREDIT NOTE
// ============================================================================

/**
 * Create credit note (opravný doklad) for an invoice
 */
export async function createCreditNote(
  invoiceId: string,
  reason: string,
  items?: InvoiceItem[]
): Promise<InvoiceWithRelations> {
  const original = await prisma.invoice.findUnique({
    where: { id: invoiceId },
  })

  if (!original) throw new Error('Invoice not found')

  // Use provided items or negate original items
  const creditItems = items || (original.items as unknown as InvoiceItem[]).map(item => ({
    ...item,
    quantity: -item.quantity,
    vatAmount: -item.vatAmount,
    total: -item.total,
    totalWithoutVat: -item.totalWithoutVat,
  }))

  // Create credit note
  const creditNote = await createInvoice({
    documentType: 'OPRAVNY_DOKLAD',
    customerId: original.customerId,
    orderId: original.orderId || undefined,
    templateId: original.templateId || undefined,

    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),

    items: creditItems,

    vatRate: original.vatRate || undefined,
    currency: original.currency,

    textBeforeItems: `Opravný doklad k faktuře ${original.invoiceNumber}`,
    notes: reason,
  })

  // Link to parent invoice
  await prisma.invoice.update({
    where: { id: creditNote.id },
    data: { parentInvoiceId: invoiceId },
  })

  return creditNote
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Update customer payment statistics
 */
async function updateCustomerPaymentStats(customerId: string): Promise<void> {
  // Get all paid invoices for customer
  const invoices = await prisma.invoice.findMany({
    where: {
      customerId,
      invoiceStatus: 'PAID',
    },
    select: {
      totalAmount: true,
      paidAmount: true,
      issueDate: true,
      paidDate: true,
    },
  })

  if (invoices.length === 0) return

  // Calculate average payment days
  const paymentDays = invoices
    .filter(inv => inv.paidDate)
    .map(inv => {
      const diff = new Date(inv.paidDate!).getTime() - new Date(inv.issueDate).getTime()
      return Math.ceil(diff / (1000 * 60 * 60 * 24))
    })

  const averagePaymentDays = paymentDays.length > 0
    ? Math.round(paymentDays.reduce((a, b) => a + b, 0) / paymentDays.length)
    : null

  // Determine reliability
  let paymentReliability: string | null = null
  if (averagePaymentDays !== null) {
    if (averagePaymentDays <= 7) paymentReliability = 'excellent'
    else if (averagePaymentDays <= 14) paymentReliability = 'good'
    else if (averagePaymentDays <= 30) paymentReliability = 'average'
    else paymentReliability = 'poor'
  }

  // Calculate totals
  const totalPaid = invoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0)

  // Get all invoices count
  const allInvoices = await prisma.invoice.count({
    where: { customerId },
  })

  // Get overdue count
  const overdueCount = await prisma.invoice.count({
    where: {
      customerId,
      invoiceStatus: { notIn: ['PAID', 'CANCELLED'] },
      dueDate: { lt: new Date() },
    },
  })

  // Update customer
  await prisma.customer.update({
    where: { id: customerId },
    data: {
      averagePaymentDays,
      paymentReliability,
      totalPaid,
      invoiceCount: allInvoices,
      overdueCount,
      lastPaymentDate: invoices[0]?.paidDate || undefined,
    },
  })
}

/**
 * Check and update overdue invoices
 */
export async function updateOverdueInvoices(): Promise<number> {
  const result = await prisma.invoice.updateMany({
    where: {
      invoiceStatus: { in: ['SENT', 'VIEWED'] },
      dueDate: { lt: new Date() },
    },
    data: {
      invoiceStatus: 'OVERDUE',
      status: 'overdue',
    },
  })

  return result.count
}
