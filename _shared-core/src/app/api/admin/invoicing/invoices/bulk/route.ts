/**
 * Invoice Bulk Actions API
 *
 * Handle bulk operations on multiple invoices
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { ids, action } = body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'No invoices selected' },
        { status: 400 }
      )
    }

    let updatedCount = 0

    switch (action) {
      case 'markPaid':
        // Mark all selected invoices as paid
        const invoicesToPay = await prisma.invoice.findMany({
          where: {
            id: { in: ids },
            status: { in: ['SENT', 'OVERDUE', 'PARTIALLY_PAID'] },
          },
        })

        for (const invoice of invoicesToPay) {
          await prisma.invoice.update({
            where: { id: invoice.id },
            data: {
              status: 'PAID',
              paidAmount: invoice.totalAmount,
              paidAt: new Date(),
            },
          })

          // Create payment record
          await prisma.payment.create({
            data: {
              invoiceId: invoice.id,
              amount: invoice.totalAmount - (invoice.paidAmount || 0),
              paidAt: new Date(),
              paymentMethod: invoice.paymentMethod || 'BANK_TRANSFER',
              note: 'Hromadná úhrada',
            },
          })

          updatedCount++
        }
        break

      case 'send':
        // Mark all selected draft invoices as sent
        const result = await prisma.invoice.updateMany({
          where: {
            id: { in: ids },
            status: 'DRAFT',
          },
          data: {
            status: 'SENT',
            sentAt: new Date(),
          },
        })
        updatedCount = result.count
        break

      case 'cancel':
        // Cancel all selected invoices (except paid ones)
        const cancelResult = await prisma.invoice.updateMany({
          where: {
            id: { in: ids },
            status: { notIn: ['PAID', 'CANCELLED'] },
          },
          data: {
            status: 'CANCELLED',
          },
        })
        updatedCount = cancelResult.count
        break

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      updatedCount,
    })
  } catch (error) {
    console.error('Error in bulk action:', error)
    return NextResponse.json(
      { error: 'Failed to perform bulk action' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { ids } = body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'No invoices selected' },
        { status: 400 }
      )
    }

    // Delete payments first
    await prisma.payment.deleteMany({
      where: { invoiceId: { in: ids } },
    })

    // Delete invoice items
    await prisma.invoiceItem.deleteMany({
      where: { invoiceId: { in: ids } },
    })

    // Delete invoices
    const result = await prisma.invoice.deleteMany({
      where: { id: { in: ids } },
    })

    return NextResponse.json({
      success: true,
      deletedCount: result.count,
    })
  } catch (error) {
    console.error('Error in bulk delete:', error)
    return NextResponse.json(
      { error: 'Failed to delete invoices' },
      { status: 500 }
    )
  }
}
