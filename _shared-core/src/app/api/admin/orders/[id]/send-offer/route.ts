/**
 * API Route: /api/admin/orders/[id]/send-offer
 * Send or resend offer email to customer with confirmation link
 *
 * This endpoint is used for:
 * - Manual sending of offer (if not sent automatically)
 * - Resending offer after modifications
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendOrderOffer } from '@/lib/orders/send-offer'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/admin/orders/[id]/send-offer
 * Generate confirmation token and send offer email to customer
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Get current order status for potential revert
    const order = await prisma.order.findUnique({
      where: { id },
      select: { status: true, customerId: true },
    })

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Objednavka nenalezena' },
        { status: 404 }
      )
    }

    // Use shared function to send offer
    const result = await sendOrderOffer(id, order.status)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }

    // Get customer email for response message
    const customer = order.customerId
      ? await prisma.customer.findUnique({
          where: { id: order.customerId },
          select: { email: true },
        })
      : null

    return NextResponse.json({
      success: true,
      message: `Nabidka odeslana na ${customer?.email || 'zakaznika'}`,
      confirmationUrl: result.confirmationUrl,
      expiresAt: result.expiresAt,
    })
  } catch (error) {
    console.error('Error sending offer:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Chyba pri odesilani nabidky',
      },
      { status: 500 }
    )
  }
}
