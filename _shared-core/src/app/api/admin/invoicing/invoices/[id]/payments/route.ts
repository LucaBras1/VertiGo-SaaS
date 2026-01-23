/**
 * Invoice Payments API
 *
 * Manage payments for an invoice
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payments = await prisma.payment.findMany({
      where: { invoiceId: params.id },
      orderBy: { paidAt: 'desc' },
    })

    return NextResponse.json({ payments })
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { amount, paidAt, paymentMethod, note, transactionId } = body

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid payment amount' },
        { status: 400 }
      )
    }

    // Get current invoice
    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
    })

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    // Calculate new paid amount
    const newPaidAmount = (invoice.paidAmount || 0) + amount
    const isFullyPaid = newPaidAmount >= invoice.totalAmount

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        invoiceId: params.id,
        amount,
        paidAt: paidAt ? new Date(paidAt) : new Date(),
        paymentMethod: paymentMethod || invoice.paymentMethod || 'BANK_TRANSFER',
        note,
        transactionId,
      },
    })

    // Update invoice
    await prisma.invoice.update({
      where: { id: params.id },
      data: {
        paidAmount: newPaidAmount,
        paidAt: isFullyPaid ? new Date() : invoice.paidAt,
        status: isFullyPaid ? 'PAID' : 'PARTIALLY_PAID',
      },
    })

    // Update customer payment stats if fully paid
    if (isFullyPaid && invoice.customerId) {
      const customer = await prisma.customer.findUnique({
        where: { id: invoice.customerId },
      })

      if (customer) {
        // Calculate days to pay
        const daysToPayment = Math.floor(
          (new Date().getTime() - new Date(invoice.issueDate).getTime()) /
            (1000 * 60 * 60 * 24)
        )

        // Update average payment days
        const currentAvg = customer.averagePaymentDays || 0
        const totalInvoices = customer.totalInvoices || 0
        const newAvg =
          totalInvoices > 0
            ? (currentAvg * totalInvoices + daysToPayment) / (totalInvoices + 1)
            : daysToPayment

        await prisma.customer.update({
          where: { id: invoice.customerId },
          data: {
            averagePaymentDays: Math.round(newAvg),
            lastPaymentDate: new Date(),
          },
        })
      }
    }

    return NextResponse.json({
      payment,
      invoice: {
        paidAmount: newPaidAmount,
        status: isFullyPaid ? 'PAID' : 'PARTIALLY_PAID',
      },
    })
  } catch (error) {
    console.error('Error creating payment:', error)
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const paymentId = url.searchParams.get('paymentId')

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID required' },
        { status: 400 }
      )
    }

    // Get payment to delete
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    })

    if (!payment || payment.invoiceId !== params.id) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    // Delete payment
    await prisma.payment.delete({
      where: { id: paymentId },
    })

    // Update invoice
    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
    })

    if (invoice) {
      const newPaidAmount = Math.max(0, (invoice.paidAmount || 0) - payment.amount)
      const newStatus =
        newPaidAmount <= 0
          ? 'SENT'
          : newPaidAmount >= invoice.totalAmount
            ? 'PAID'
            : 'PARTIALLY_PAID'

      await prisma.invoice.update({
        where: { id: params.id },
        data: {
          paidAmount: newPaidAmount,
          paidAt: newStatus === 'PAID' ? invoice.paidAt : null,
          status: newStatus,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting payment:', error)
    return NextResponse.json(
      { error: 'Failed to delete payment' },
      { status: 500 }
    )
  }
}
