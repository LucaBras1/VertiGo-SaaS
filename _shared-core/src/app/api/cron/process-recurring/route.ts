/**
 * Process Recurring Invoices Cron Job
 *
 * This endpoint should be called daily (e.g., via Vercel Cron or external scheduler)
 * to process recurring invoices and create new invoices when due
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { generateInvoiceNumber } from '@/lib/invoicing/number-generator'

// Verify cron secret for security
const CRON_SECRET = process.env.CRON_SECRET

export async function GET(request: NextRequest) {
  // Verify authorization
  const authHeader = request.headers.get('authorization')
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Find all active recurring invoices that are due
    const recurringInvoices = await prisma.recurringInvoice.findMany({
      where: {
        isActive: true,
        nextGenerationDate: {
          lte: today,
        },
        OR: [
          { endDate: null },
          { endDate: { gte: today } },
        ],
      },
      include: {
        customer: true,
        template: true,
        numberSeries: true,
      },
    })

    const results = {
      processed: 0,
      created: 0,
      errors: [] as string[],
    }

    for (const recurring of recurringInvoices) {
      try {
        // Generate invoice number
        const invoiceNumber = await generateInvoiceNumber(
          recurring.documentType,
          recurring.numberSeriesId || undefined
        )

        // Parse items from recurring invoice
        const items = recurring.items as any[]

        // Calculate totals
        let totalWithoutVat = 0
        let vatAmount = 0
        let totalAmount = 0

        for (const item of items) {
          totalWithoutVat += item.totalWithoutVat || 0
          vatAmount += item.vatAmount || 0
          totalAmount += item.totalWithVat || item.totalWithoutVat || 0
        }

        // Create new invoice
        const invoice = await prisma.invoice.create({
          data: {
            invoiceNumber,
            documentType: recurring.documentType,
            status: recurring.autoSend ? 'SENT' : 'DRAFT',
            customerId: recurring.customerId,
            templateId: recurring.templateId,
            numberSeriesId: recurring.numberSeriesId,
            issueDate: new Date(),
            dueDate: new Date(Date.now() + recurring.paymentDays * 24 * 60 * 60 * 1000),
            taxableSupplyDate: new Date(),
            currency: recurring.currency,
            paymentMethod: 'BANK_TRANSFER',
            totalWithoutVat,
            vatAmount,
            totalAmount,
            paidAmount: 0,
            note: recurring.note,
            headerText: recurring.headerText,
            footerText: recurring.footerText,
            sentAt: recurring.autoSend ? new Date() : null,
            items: {
              create: items.map((item, index) => ({
                position: index,
                description: item.description,
                quantity: item.quantity,
                unit: item.unit,
                unitPrice: item.unitPrice,
                vatRate: item.vatRate,
                discount: item.discount || 0,
                discountType: item.discountType || 'PERCENTAGE',
                totalWithoutVat: item.totalWithoutVat,
                vatAmount: item.vatAmount,
                totalWithVat: item.totalWithVat || item.totalWithoutVat,
              })),
            },
          },
        })

        // Calculate next generation date
        let nextDate = new Date(recurring.nextGenerationDate)
        switch (recurring.frequency) {
          case 'WEEKLY':
            nextDate.setDate(nextDate.getDate() + 7)
            break
          case 'MONTHLY':
            nextDate.setMonth(nextDate.getMonth() + 1)
            break
          case 'QUARTERLY':
            nextDate.setMonth(nextDate.getMonth() + 3)
            break
          case 'YEARLY':
            nextDate.setFullYear(nextDate.getFullYear() + 1)
            break
        }

        // Update recurring invoice
        await prisma.recurringInvoice.update({
          where: { id: recurring.id },
          data: {
            lastGeneratedAt: new Date(),
            nextGenerationDate: nextDate,
            generatedCount: { increment: 1 },
          },
        })

        results.created++

        // Send email if autoSend is enabled
        if (recurring.autoSend && recurring.customer?.email) {
          // TODO: Implement email sending
          // await sendInvoiceEmail(invoice.id, recurring.customer.email)
        }
      } catch (err) {
        results.errors.push(
          `Failed to process recurring invoice ${recurring.id}: ${err instanceof Error ? err.message : 'Unknown error'}`
        )
      }

      results.processed++
    }

    return NextResponse.json({
      success: true,
      ...results,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error processing recurring invoices:', error)
    return NextResponse.json(
      { error: 'Failed to process recurring invoices' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  // Allow POST as well for flexibility
  return GET(request)
}
