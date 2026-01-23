// API Route: /api/admin/orders/[id]/status
// Update order status with optional auto-proforma creation

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createInvoiceFromOrder } from '@/lib/vyfakturuj/invoice-sync'
import { sendParticipantInvites } from '@/lib/participants'
import type { OrderStatus } from '@/types/admin'
import { isValidTransition, ORDER_STATUSES, OrderStatus as WorkflowStatus } from '@/lib/order-workflow'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * PATCH /api/admin/orders/[id]/status
 * Update order status with optional approval info
 *
 * If autoCreateProforma is enabled in settings and status changes to 'confirmed',
 * a proforma invoice will be automatically created.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    if (!body.status) {
      return NextResponse.json(
        {
          success: false,
          error: 'Status is required',
        },
        { status: 400 }
      )
    }

    const validStatuses: OrderStatus[] = [
      'new',
      'reviewing',
      'awaiting_info',
      'quote_sent',
      'confirmed',
      'approved',
      'completed',
      'cancelled',
    ]

    if (!validStatuses.includes(body.status)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        },
        { status: 400 }
      )
    }

    // Get current order to check if status is actually changing to 'confirmed'
    const currentOrder = await prisma.order.findUnique({
      where: { id },
      select: { status: true, invoices: { select: { id: true } } },
    })

    // Validate workflow transition
    if (currentOrder) {
      const currentStatus = currentOrder.status as WorkflowStatus
      const newStatus = body.status as WorkflowStatus
      if (!isValidTransition(currentStatus, newStatus)) {
        const currentLabel = ORDER_STATUSES[currentStatus]?.label || currentStatus
        const newLabel = ORDER_STATUSES[newStatus]?.label || newStatus
        return NextResponse.json(
          {
            success: false,
            error: `Nelze zmenit stav z "${currentLabel}" na "${newLabel}"`,
          },
          { status: 400 }
        )
      }
    }

    // Update order status using Prisma directly (not Sanity)
    const updateData: any = {
      status: body.status,
      updatedAt: new Date(),
    }

    // If approving, add approval info
    if (body.status === 'approved' && body.approvalInfo) {
      updateData.approvalInfo = {
        ...body.approvalInfo,
        approvedAt: new Date().toISOString(),
      }
    }

    const order = await prisma.order.update({
      where: { id },
      data: updateData,
    })

    // Auto-create proforma if:
    // 1. Status changed TO 'confirmed' (not already confirmed)
    // 2. Order doesn't already have an invoice
    // 3. autoCreateProforma is enabled in settings
    let proformaCreated = false
    let proformaError: string | undefined

    if (
      body.status === 'confirmed' &&
      currentOrder?.status !== 'confirmed' &&
      (!currentOrder?.invoices || currentOrder.invoices.length === 0)
    ) {
      try {
        const settings = await prisma.vyfakturujSettings.findFirst({
          where: { id: 'singleton' },
          select: { isConfigured: true, autoCreateProforma: true },
        })

        if (settings?.isConfigured && settings?.autoCreateProforma) {
          const result = await createInvoiceFromOrder(id, {
            type: 'proforma',
            sendEmail: false,
          })

          if (result.success) {
            proformaCreated = true
            console.log(`[Auto-Proforma] Created proforma ${result.vyfakturujNumber} for order ${id}`)
          } else {
            proformaError = result.message
            console.error(`[Auto-Proforma] Failed to create proforma for order ${id}:`, result.message)
          }
        }
      } catch (error) {
        proformaError = error instanceof Error ? error.message : 'Unknown error'
        console.error(`[Auto-Proforma] Error creating proforma for order ${id}:`, error)
      }
    }

    // Auto-send participant invites if:
    // 1. Status changed TO 'confirmed' (not already confirmed)
    // 2. Google Calendar is configured
    let invitesSent = false
    let invitesResult: { calendarEvents: number; emailsSent: number; errors: string[] } | undefined

    if (
      body.status === 'confirmed' &&
      currentOrder?.status !== 'confirmed'
    ) {
      try {
        const result = await sendParticipantInvites({
          orderId: id,
          sendCalendar: true,
          sendEmail: true,
        })

        if (result.participantCount > 0) {
          invitesSent = true
          invitesResult = {
            calendarEvents: result.calendarEvents.length,
            emailsSent: result.emailsSent,
            errors: result.errors,
          }
          console.log(
            `[Auto-Invites] Sent invites for order ${id}: ${result.calendarEvents.length} calendar, ${result.emailsSent} emails`
          )
        }
      } catch (error) {
        console.error(`[Auto-Invites] Error sending invites for order ${id}:`, error)
      }
    }

    return NextResponse.json({
      success: true,
      data: order,
      proformaCreated,
      proformaError,
      invitesSent,
      invitesResult,
    })
  } catch (error) {
    console.error('Error updating order status:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update order status',
      },
      { status: 500 }
    )
  }
}
