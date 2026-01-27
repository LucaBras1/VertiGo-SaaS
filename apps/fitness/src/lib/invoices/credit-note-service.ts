/**
 * Credit Note Service
 *
 * Handles credit note creation, application, and management.
 */

import { prisma } from '@/lib/prisma'
import { Decimal } from '@prisma/client/runtime/library'

interface CreateCreditNoteData {
  tenantId: string
  invoiceId: string
  amount: number
  reason: string
  notes?: string
}

/**
 * Generate unique credit note number
 */
async function generateCreditNoteNumber(tenantId: string): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = `CN${year}`

  const lastCreditNote = await prisma.creditNote.findFirst({
    where: {
      tenantId,
      creditNoteNumber: { startsWith: prefix },
    },
    orderBy: { creditNoteNumber: 'desc' },
  })

  let nextNumber = 1
  if (lastCreditNote) {
    const lastNumber = parseInt(lastCreditNote.creditNoteNumber.slice(-4))
    nextNumber = lastNumber + 1
  }

  return `${prefix}${nextNumber.toString().padStart(4, '0')}`
}

/**
 * Create a credit note for an invoice
 */
export async function createCreditNote(data: CreateCreditNoteData) {
  // Verify invoice exists and belongs to tenant
  const invoice = await prisma.invoice.findFirst({
    where: {
      id: data.invoiceId,
      tenantId: data.tenantId,
    },
  })

  if (!invoice) {
    throw new Error('Invoice not found')
  }

  // Calculate available amount for credit
  const existingCreditNotes = await prisma.creditNote.findMany({
    where: {
      invoiceId: data.invoiceId,
      status: { in: ['issued', 'applied'] },
    },
  })

  const totalCredited = existingCreditNotes.reduce(
    (sum, cn) => sum + Number(cn.total),
    0
  )

  const maxCreditAmount = invoice.total - totalCredited

  if (data.amount > maxCreditAmount) {
    throw new Error(
      `Maximum credit amount is ${maxCreditAmount}. Already credited: ${totalCredited}`
    )
  }

  const creditNoteNumber = await generateCreditNoteNumber(data.tenantId)

  // Calculate tax if invoice has tax
  const taxRate = invoice.tax / invoice.subtotal || 0
  const subtotal = data.amount / (1 + taxRate)
  const tax = data.amount - subtotal

  const creditNote = await prisma.creditNote.create({
    data: {
      tenantId: data.tenantId,
      invoiceId: data.invoiceId,
      creditNoteNumber,
      subtotal: new Decimal(subtotal),
      tax: new Decimal(tax),
      total: new Decimal(data.amount),
      reason: data.reason,
      notes: data.notes,
      status: 'draft',
    },
    include: {
      invoice: {
        include: {
          client: true,
        },
      },
    },
  })

  return creditNote
}

/**
 * Issue a credit note
 */
export async function issueCreditNote(creditNoteId: string, tenantId: string) {
  const creditNote = await prisma.creditNote.findFirst({
    where: {
      id: creditNoteId,
      tenantId,
      status: 'draft',
    },
  })

  if (!creditNote) {
    throw new Error('Credit note not found or already issued')
  }

  return prisma.creditNote.update({
    where: { id: creditNoteId },
    data: {
      status: 'issued',
      issueDate: new Date(),
    },
    include: {
      invoice: {
        include: {
          client: true,
        },
      },
    },
  })
}

/**
 * Apply a credit note to reduce invoice balance
 */
export async function applyCreditNote(creditNoteId: string, tenantId: string) {
  const creditNote = await prisma.creditNote.findFirst({
    where: {
      id: creditNoteId,
      tenantId,
      status: 'issued',
    },
    include: {
      invoice: true,
    },
  })

  if (!creditNote) {
    throw new Error('Credit note not found or cannot be applied')
  }

  const creditAmount = Number(creditNote.total)
  const invoiceRemaining = creditNote.invoice.amountRemaining
    ? Number(creditNote.invoice.amountRemaining)
    : creditNote.invoice.total - Number(creditNote.invoice.amountPaid)

  // Calculate new amounts
  const newAmountPaid = Number(creditNote.invoice.amountPaid) + creditAmount
  const newAmountRemaining = Math.max(0, invoiceRemaining - creditAmount)

  // Determine new invoice status
  let newStatus = creditNote.invoice.status
  if (newAmountRemaining <= 0) {
    newStatus = 'paid'
  } else if (newAmountPaid > 0) {
    newStatus = 'partial'
  }

  // Update in transaction
  const [updatedCreditNote, updatedInvoice] = await prisma.$transaction([
    prisma.creditNote.update({
      where: { id: creditNoteId },
      data: {
        status: 'applied',
        appliedAt: new Date(),
      },
    }),
    prisma.invoice.update({
      where: { id: creditNote.invoiceId },
      data: {
        amountPaid: new Decimal(newAmountPaid),
        amountRemaining: new Decimal(newAmountRemaining),
        status: newStatus,
        ...(newStatus === 'paid' && { paidDate: new Date() }),
      },
    }),
  ])

  return {
    creditNote: updatedCreditNote,
    invoice: updatedInvoice,
  }
}

/**
 * Record a partial payment on an invoice
 */
export async function recordPartialPayment(data: {
  invoiceId: string
  tenantId: string
  amount: number
  paymentMethod?: string
  notes?: string
}) {
  const invoice = await prisma.invoice.findFirst({
    where: {
      id: data.invoiceId,
      tenantId: data.tenantId,
    },
  })

  if (!invoice) {
    throw new Error('Invoice not found')
  }

  const currentPaid = Number(invoice.amountPaid)
  const remaining = invoice.amountRemaining
    ? Number(invoice.amountRemaining)
    : invoice.total - currentPaid

  if (data.amount > remaining) {
    throw new Error(`Maximum payment amount is ${remaining}`)
  }

  const newAmountPaid = currentPaid + data.amount
  const newAmountRemaining = remaining - data.amount

  // Determine new status
  let newStatus = invoice.status
  if (newAmountRemaining <= 0) {
    newStatus = 'paid'
  } else if (newAmountPaid > 0) {
    newStatus = 'partial'
  }

  // Create payment record
  const [updatedInvoice, payment] = await prisma.$transaction([
    prisma.invoice.update({
      where: { id: data.invoiceId },
      data: {
        amountPaid: new Decimal(newAmountPaid),
        amountRemaining: new Decimal(newAmountRemaining),
        status: newStatus,
        ...(newStatus === 'paid' && { paidDate: new Date() }),
        paymentMethod: data.paymentMethod || invoice.paymentMethod,
      },
    }),
    prisma.invoicePayment.create({
      data: {
        tenantId: data.tenantId,
        invoiceId: data.invoiceId,
        amount: new Decimal(data.amount),
        currency: 'CZK',
        method: (data.paymentMethod as 'BANK_TRANSFER' | 'CARD' | 'CASH' | 'PAYPAL' | 'STRIPE' | 'GOPAY' | 'CRYPTO') || 'BANK_TRANSFER',
        status: 'COMPLETED',
        completedAt: new Date(),
        metadata: data.notes ? { notes: data.notes } : undefined,
      },
    }),
  ])

  return {
    invoice: updatedInvoice,
    payment,
  }
}

/**
 * Get credit notes for a tenant
 */
export async function getCreditNotes(
  tenantId: string,
  options?: {
    invoiceId?: string
    status?: string
    limit?: number
    offset?: number
  }
) {
  const { invoiceId, status, limit = 50, offset = 0 } = options || {}

  const [creditNotes, total] = await Promise.all([
    prisma.creditNote.findMany({
      where: {
        tenantId,
        ...(invoiceId && { invoiceId }),
        ...(status && { status }),
      },
      include: {
        invoice: {
          include: {
            client: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.creditNote.count({
      where: {
        tenantId,
        ...(invoiceId && { invoiceId }),
        ...(status && { status }),
      },
    }),
  ])

  return { creditNotes, total }
}
