import { prisma } from '@/lib/db'

export interface InvoiceItem {
  description: string
  quantity: number
  unitPrice: number
  total: number
}

export interface CreateInvoiceInput {
  tenantId: string
  customerId: string
  gigId?: string
  dueDate: Date
  items: InvoiceItem[]
  taxRate?: number
  notes?: string
}

export interface UpdateInvoiceInput extends Partial<Omit<CreateInvoiceInput, 'tenantId' | 'customerId'>> {
  status?: 'draft' | 'sent' | 'paid' | 'overdue'
  paidDate?: Date
  paidAmount?: number
}

async function generateInvoiceNumber(tenantId: string): Promise<string> {
  const year = new Date().getFullYear()
  const count = await prisma.invoice.count({
    where: {
      tenantId,
      invoiceNumber: { startsWith: `INV-${year}` },
    },
  })
  return `INV-${year}-${String(count + 1).padStart(4, '0')}`
}

function calculateTotals(items: InvoiceItem[], taxRate: number = 0) {
  const subtotal = items.reduce((sum, item) => sum + item.total, 0)
  const taxAmount = Math.round(subtotal * (taxRate / 100))
  const totalAmount = subtotal + taxAmount
  return { subtotal, taxAmount, totalAmount }
}

export async function getInvoices(tenantId: string, options?: {
  status?: string
  customerId?: string
  gigId?: string
  search?: string
  limit?: number
  offset?: number
}) {
  const where: any = { tenantId }

  if (options?.status) {
    where.status = options.status
  }

  if (options?.customerId) {
    where.customerId = options.customerId
  }

  if (options?.gigId) {
    where.gigId = options.gigId
  }

  if (options?.search) {
    where.OR = [
      { invoiceNumber: { contains: options.search, mode: 'insensitive' } },
      { customer: { firstName: { contains: options.search, mode: 'insensitive' } } },
      { customer: { lastName: { contains: options.search, mode: 'insensitive' } } },
    ]
  }

  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: options?.limit || 50,
      skip: options?.offset || 0,
      include: {
        customer: true,
        gig: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    }),
    prisma.invoice.count({ where }),
  ])

  return { invoices, total }
}

export async function getInvoiceById(id: string, tenantId: string) {
  return prisma.invoice.findFirst({
    where: { id, tenantId },
    include: {
      customer: true,
      gig: true,
    },
  })
}

export async function createInvoice(input: CreateInvoiceInput) {
  const invoiceNumber = await generateInvoiceNumber(input.tenantId)
  const { subtotal, taxAmount, totalAmount } = calculateTotals(input.items, input.taxRate)

  return prisma.invoice.create({
    data: {
      tenantId: input.tenantId,
      invoiceNumber,
      customerId: input.customerId,
      gigId: input.gigId,
      dueDate: input.dueDate,
      items: JSON.parse(JSON.stringify(input.items)),
      subtotal,
      taxRate: input.taxRate || 0,
      taxAmount,
      totalAmount,
      notes: input.notes,
      status: 'draft',
    },
    include: {
      customer: true,
    },
  })
}

export async function updateInvoice(id: string, tenantId: string, input: UpdateInvoiceInput) {
  const existing = await prisma.invoice.findFirst({
    where: { id, tenantId },
  })

  if (!existing) {
    throw new Error('Invoice not found')
  }

  let updateData: any = { ...input }

  // Recalculate totals if items changed
  if (input.items) {
    const taxRate = input.taxRate ?? existing.taxRate
    const { subtotal, taxAmount, totalAmount } = calculateTotals(input.items, taxRate)
    updateData = {
      ...updateData,
      items: JSON.parse(JSON.stringify(input.items)),
      subtotal,
      taxAmount,
      totalAmount,
    }
  }

  // Handle paid status
  if (input.status === 'paid' && !input.paidDate) {
    updateData.paidDate = new Date()
    updateData.paidAmount = existing.totalAmount
  }

  return prisma.invoice.update({
    where: { id },
    data: updateData,
    include: {
      customer: true,
    },
  })
}

export async function deleteInvoice(id: string, tenantId: string) {
  const existing = await prisma.invoice.findFirst({
    where: { id, tenantId },
  })

  if (!existing) {
    throw new Error('Invoice not found')
  }

  if (existing.status === 'paid') {
    throw new Error('Cannot delete paid invoice')
  }

  return prisma.invoice.delete({
    where: { id },
  })
}

export async function getInvoiceStats(tenantId: string) {
  const [total, paid, pending, overdue] = await Promise.all([
    prisma.invoice.count({ where: { tenantId } }),
    prisma.invoice.aggregate({
      where: { tenantId, status: 'paid' },
      _sum: { totalAmount: true },
      _count: true,
    }),
    prisma.invoice.aggregate({
      where: { tenantId, status: { in: ['draft', 'sent'] } },
      _sum: { totalAmount: true },
      _count: true,
    }),
    prisma.invoice.aggregate({
      where: { tenantId, status: 'overdue' },
      _sum: { totalAmount: true },
      _count: true,
    }),
  ])

  return {
    total,
    paidCount: paid._count,
    paidAmount: paid._sum.totalAmount || 0,
    pendingCount: pending._count,
    pendingAmount: pending._sum.totalAmount || 0,
    overdueCount: overdue._count,
    overdueAmount: overdue._sum.totalAmount || 0,
  }
}
