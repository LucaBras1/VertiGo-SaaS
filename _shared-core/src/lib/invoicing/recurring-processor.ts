/**
 * Recurring Invoice Processor
 *
 * Handles automatic generation of recurring invoices
 */

import { prisma } from '@/lib/prisma'
import { createInvoice } from './invoice-service'
import { InvoiceItem, DocumentType, RecurringFrequency } from '@/types/invoicing'

/**
 * Process all due recurring invoices
 * Should be called by a daily cron job
 */
export async function processRecurringInvoices(): Promise<{
  processed: number
  failed: number
  errors: string[]
}> {
  const now = new Date()
  const errors: string[] = []
  let processed = 0
  let failed = 0

  // Get all active recurring invoices that are due
  const dueRecurring = await prisma.recurringInvoice.findMany({
    where: {
      isActive: true,
      nextGenerateAt: { lte: now },
      OR: [
        { endDate: null },
        { endDate: { gte: now } },
      ],
    },
    include: {
      customer: true,
    },
  })

  for (const recurring of dueRecurring) {
    try {
      // Generate invoice
      const invoice = await createInvoice({
        documentType: recurring.documentType as DocumentType,
        customerId: recurring.customerId,
        numberSeriesId: recurring.numberSeriesId || undefined,
        templateId: recurring.templateId || undefined,

        dueDate: new Date(Date.now() + recurring.daysDue * 24 * 60 * 60 * 1000),

        items: recurring.items as unknown as InvoiceItem[],

        subtotal: recurring.subtotal,
        vatRate: recurring.vatRate || undefined,
        vatAmount: recurring.vatAmount || undefined,
        totalAmount: recurring.totalAmount,

        textBeforeItems: recurring.textBeforeItems || undefined,
        textAfterItems: recurring.textAfterItems || undefined,
        notes: recurring.notes || undefined,
        internalNote: `Automaticky vygenerováno z pravidelné faktury: ${recurring.name}`,
      })

      // Calculate next generation date
      const nextDate = calculateNextDate(
        recurring.nextGenerateAt,
        recurring.frequency as RecurringFrequency,
        recurring.dayOfMonth,
        recurring.dayOfWeek,
        recurring.monthOfYear
      )

      // Update recurring invoice
      await prisma.recurringInvoice.update({
        where: { id: recurring.id },
        data: {
          lastGeneratedAt: now,
          nextGenerateAt: nextDate,
          generatedCount: { increment: 1 },
        },
      })

      // Link invoice to recurring
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { recurringInvoiceId: recurring.id },
      })

      // Auto-send if enabled
      if (recurring.autoSend) {
        // TODO: Implement auto-send with email templates
        // await sendInvoiceEmail(invoice.id, recurring.emailRecipients)
      }

      processed++
    } catch (error) {
      failed++
      errors.push(`Failed to process recurring invoice ${recurring.id}: ${error}`)
      console.error(`Failed to process recurring invoice ${recurring.id}:`, error)
    }
  }

  return { processed, failed, errors }
}

/**
 * Calculate next generation date based on frequency
 */
function calculateNextDate(
  currentDate: Date,
  frequency: RecurringFrequency,
  dayOfMonth?: number | null,
  dayOfWeek?: number | null,
  monthOfYear?: number | null
): Date {
  const date = new Date(currentDate)

  switch (frequency) {
    case 'weekly':
      // Add 7 days
      date.setDate(date.getDate() + 7)
      // Adjust to specific day of week if set
      if (dayOfWeek !== null && dayOfWeek !== undefined) {
        const diff = dayOfWeek - date.getDay()
        date.setDate(date.getDate() + diff)
        if (diff <= 0) date.setDate(date.getDate() + 7)
      }
      break

    case 'monthly':
      // Add 1 month
      date.setMonth(date.getMonth() + 1)
      // Set to specific day if set
      if (dayOfMonth !== null && dayOfMonth !== undefined) {
        const maxDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
        date.setDate(Math.min(dayOfMonth, maxDay))
      }
      break

    case 'quarterly':
      // Add 3 months
      date.setMonth(date.getMonth() + 3)
      if (dayOfMonth !== null && dayOfMonth !== undefined) {
        const maxDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
        date.setDate(Math.min(dayOfMonth, maxDay))
      }
      break

    case 'yearly':
      // Add 1 year
      date.setFullYear(date.getFullYear() + 1)
      // Set to specific month and day if set
      if (monthOfYear !== null && monthOfYear !== undefined) {
        date.setMonth(monthOfYear - 1)
      }
      if (dayOfMonth !== null && dayOfMonth !== undefined) {
        const maxDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
        date.setDate(Math.min(dayOfMonth, maxDay))
      }
      break
  }

  return date
}

/**
 * Create a new recurring invoice
 */
export async function createRecurringInvoice(data: {
  name: string
  description?: string
  customerId: string
  frequency: RecurringFrequency
  dayOfMonth?: number
  dayOfWeek?: number
  monthOfYear?: number
  startDate: Date
  endDate?: Date
  documentType?: DocumentType
  numberSeriesId?: string
  templateId?: string
  items: InvoiceItem[]
  daysDue?: number
  textBeforeItems?: string
  textAfterItems?: string
  notes?: string
  autoSend?: boolean
  emailRecipients?: { email: string; name?: string }[]
}) {
  // Calculate totals
  const subtotal = data.items.reduce((sum, item) => sum + item.totalWithoutVat, 0)
  const vatAmount = data.items.reduce((sum, item) => sum + item.vatAmount, 0)
  const totalAmount = subtotal + vatAmount

  // Calculate first generation date
  const nextGenerateAt = calculateNextDate(
    data.startDate,
    data.frequency,
    data.dayOfMonth,
    data.dayOfWeek,
    data.monthOfYear
  )

  return prisma.recurringInvoice.create({
    data: {
      name: data.name,
      description: data.description,
      isActive: true,

      customerId: data.customerId,

      frequency: data.frequency,
      dayOfMonth: data.dayOfMonth,
      dayOfWeek: data.dayOfWeek,
      monthOfYear: data.monthOfYear,

      startDate: data.startDate,
      endDate: data.endDate,
      nextGenerateAt,

      documentType: data.documentType || 'FAKTURA',
      numberSeriesId: data.numberSeriesId,
      templateId: data.templateId,

      items: data.items as unknown as object,
      subtotal,
      vatAmount,
      totalAmount,
      daysDue: data.daysDue || 14,

      textBeforeItems: data.textBeforeItems,
      textAfterItems: data.textAfterItems,
      notes: data.notes,

      autoSend: data.autoSend || false,
      emailRecipients: data.emailRecipients || [],
    },
    include: {
      customer: true,
    },
  })
}

/**
 * Update recurring invoice
 */
export async function updateRecurringInvoice(
  id: string,
  data: Partial<Parameters<typeof createRecurringInvoice>[0]> & { isActive?: boolean }
) {
  const updateData: Record<string, unknown> = {}

  if (data.name !== undefined) updateData.name = data.name
  if (data.description !== undefined) updateData.description = data.description
  if (data.isActive !== undefined) updateData.isActive = data.isActive

  if (data.frequency !== undefined) updateData.frequency = data.frequency
  if (data.dayOfMonth !== undefined) updateData.dayOfMonth = data.dayOfMonth
  if (data.dayOfWeek !== undefined) updateData.dayOfWeek = data.dayOfWeek
  if (data.monthOfYear !== undefined) updateData.monthOfYear = data.monthOfYear

  if (data.startDate !== undefined) updateData.startDate = data.startDate
  if (data.endDate !== undefined) updateData.endDate = data.endDate

  if (data.documentType !== undefined) updateData.documentType = data.documentType
  if (data.numberSeriesId !== undefined) updateData.numberSeriesId = data.numberSeriesId
  if (data.templateId !== undefined) updateData.templateId = data.templateId

  if (data.items !== undefined) {
    updateData.items = data.items
    const subtotal = data.items.reduce((sum, item) => sum + item.totalWithoutVat, 0)
    const vatAmount = data.items.reduce((sum, item) => sum + item.vatAmount, 0)
    updateData.subtotal = subtotal
    updateData.vatAmount = vatAmount
    updateData.totalAmount = subtotal + vatAmount
  }

  if (data.daysDue !== undefined) updateData.daysDue = data.daysDue
  if (data.textBeforeItems !== undefined) updateData.textBeforeItems = data.textBeforeItems
  if (data.textAfterItems !== undefined) updateData.textAfterItems = data.textAfterItems
  if (data.notes !== undefined) updateData.notes = data.notes
  if (data.autoSend !== undefined) updateData.autoSend = data.autoSend
  if (data.emailRecipients !== undefined) updateData.emailRecipients = data.emailRecipients

  return prisma.recurringInvoice.update({
    where: { id },
    data: updateData,
  })
}

/**
 * Delete recurring invoice
 */
export async function deleteRecurringInvoice(id: string) {
  return prisma.recurringInvoice.delete({ where: { id } })
}

/**
 * List recurring invoices
 */
export async function listRecurringInvoices(
  filters: { customerId?: string; isActive?: boolean } = {},
  page = 1,
  pageSize = 25
) {
  const where: Record<string, unknown> = {}

  if (filters.customerId) where.customerId = filters.customerId
  if (filters.isActive !== undefined) where.isActive = filters.isActive

  const total = await prisma.recurringInvoice.count({ where })

  const data = await prisma.recurringInvoice.findMany({
    where,
    include: {
      customer: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          organization: true,
        },
      },
    },
    orderBy: { nextGenerateAt: 'asc' },
    skip: (page - 1) * pageSize,
    take: pageSize,
  })

  return {
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}
