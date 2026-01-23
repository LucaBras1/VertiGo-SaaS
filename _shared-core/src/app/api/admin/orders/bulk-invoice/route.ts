/**
 * Bulk Invoice Creation from Orders
 *
 * POST /api/admin/orders/bulk-invoice
 *
 * Hromadné vytvoření faktur z více objednávek najednou.
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createInvoiceFromOrder } from '@/lib/vyfakturuj/invoice-sync'
import type { CreateInvoiceOptions } from '@/lib/vyfakturuj/invoice-sync'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface BulkInvoiceRequest {
  orderIds: string[]
  options?: {
    type?: 'invoice' | 'proforma' | 'advance'
    sendEmail?: boolean
  }
}

interface BulkInvoiceResult {
  orderId: string
  orderNumber: string
  success: boolean
  invoiceId?: string
  invoiceNumber?: string
  error?: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as BulkInvoiceRequest

    if (!body.orderIds || !Array.isArray(body.orderIds) || body.orderIds.length === 0) {
      return NextResponse.json(
        { error: 'orderIds array is required' },
        { status: 400 }
      )
    }

    // Check if Vyfakturuj is configured
    const settings = await prisma.vyfakturujSettings.findFirst({
      where: { id: 'singleton' },
    })

    if (!settings?.isConfigured) {
      return NextResponse.json(
        { error: 'Vyfakturuj is not configured' },
        { status: 400 }
      )
    }

    // Get orders that can have invoices created
    const orders = await prisma.order.findMany({
      where: {
        id: { in: body.orderIds },
        status: { in: ['confirmed', 'approved', 'completed'] },
      },
      select: {
        id: true,
        orderNumber: true,
        customerId: true,
        invoices: {
          select: { id: true },
        },
        // Note: customer email can be fetched from Prisma via customerId
      },
    })

    if (orders.length === 0) {
      return NextResponse.json(
        { error: 'No eligible orders found. Orders must be in confirmed, approved, or completed status.' },
        { status: 400 }
      )
    }

    const results: BulkInvoiceResult[] = []
    let succeeded = 0
    let failed = 0

    // Process each order
    for (const order of orders) {
      try {
        // Skip if order already has invoice
        if (order.invoices && order.invoices.length > 0) {
          results.push({
            orderId: order.id,
            orderNumber: order.orderNumber,
            success: false,
            error: 'Order already has an invoice',
          })
          failed++
          continue
        }

        // Prepare options
        const options: CreateInvoiceOptions = {
          type: body.options?.type || 'invoice',
          sendEmail: body.options?.sendEmail || false,
        }

        // Note: Email sending disabled - can be enabled by fetching customer email from Prisma
        // To re-enable, fetch customer by customerId from Prisma and get email
        // if (options.sendEmail && customerEmail) {
        //   options.emailRecipients = [customerEmail]
        // }

        // Create invoice
        const result = await createInvoiceFromOrder(order.id, options)

        if (result.success) {
          results.push({
            orderId: order.id,
            orderNumber: order.orderNumber,
            success: true,
            invoiceId: result.invoiceId,
            invoiceNumber: result.vyfakturujNumber,
          })
          succeeded++
        } else {
          results.push({
            orderId: order.id,
            orderNumber: order.orderNumber,
            success: false,
            error: result.message,
          })
          failed++
        }
      } catch (error) {
        results.push({
          orderId: order.id,
          orderNumber: order.orderNumber,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
        failed++
      }
    }

    // Check for orders not found
    const processedOrderIds = orders.map(o => o.id)
    const notFoundOrderIds = body.orderIds.filter(id => !processedOrderIds.includes(id))

    for (const orderId of notFoundOrderIds) {
      results.push({
        orderId,
        orderNumber: 'N/A',
        success: false,
        error: 'Order not found or not in eligible status',
      })
      failed++
    }

    return NextResponse.json({
      success: failed === 0,
      message: `Created ${succeeded} invoices${failed > 0 ? `, ${failed} failed` : ''}`,
      data: {
        succeeded,
        failed,
        total: body.orderIds.length,
        results,
      },
    })
  } catch (error) {
    console.error('[Bulk Invoice] Error:', error)

    return NextResponse.json(
      {
        error: 'Failed to create invoices',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
