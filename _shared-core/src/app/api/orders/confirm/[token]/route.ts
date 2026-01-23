/**
 * API Route: /api/orders/confirm/[token]
 * Public endpoint for customer to view and confirm/reject order offer
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail, getBaseUrl, getAdminEmail } from '@/lib/email'
import {
  generateConfirmationNotificationHtml,
  generateConfirmationNotificationText,
  getConfirmationNotificationSubject,
  generateRejectionNotificationHtml,
  generateRejectionNotificationText,
  getRejectionNotificationSubject,
} from '@/lib/email/templates/admin-notification'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type ConfirmationStatus = 'pending' | 'confirmed' | 'reviewing' | 'expired' | 'not_found'

interface OrderConfirmationData {
  orderNumber: string
  eventName: string | null
  dates: string[]
  venue: {
    name: string
    street?: string
    city?: string
    postalCode?: string
  }
  items: Array<{
    name: string
    date?: string
    startTime?: string
    endTime?: string
    price: number
  }>
  pricing: {
    subtotal?: number
    travelCosts?: number
    discount?: number
    totalPrice: number
    vatIncluded?: boolean
  }
  customer: {
    firstName: string
    lastName: string
    organization?: string
  }
}

/**
 * GET /api/orders/confirm/[token]
 * Get order data for confirmation page
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params

    // Find order by token
    const order = await prisma.order.findUnique({
      where: { confirmationToken: token },
      include: {
        items: {
          include: {
            performance: true,
            game: true,
            service: true,
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json({
        success: true,
        status: 'not_found' as ConfirmationStatus,
        order: null,
      })
    }

    // Check if already confirmed
    if (order.status === 'confirmed' || order.confirmedAt) {
      return NextResponse.json({
        success: true,
        status: 'confirmed' as ConfirmationStatus,
        confirmedAt: order.confirmedAt?.toISOString(),
        order: null,
      })
    }

    // Check if in reviewing status (customer sent comments)
    if (order.status === 'reviewing' && order.customerComments) {
      return NextResponse.json({
        success: true,
        status: 'reviewing' as ConfirmationStatus,
        order: null,
      })
    }

    // Check if token expired
    if (order.confirmationTokenExp && new Date() > order.confirmationTokenExp) {
      return NextResponse.json({
        success: true,
        status: 'expired' as ConfirmationStatus,
        order: null,
      })
    }

    // Get customer from Prisma (customer is optional)
    const customer = order.customerId
      ? await prisma.customer.findUnique({
          where: { id: order.customerId },
        })
      : null

    // Prepare order data for frontend
    const pricing = order.pricing as any || {}
    const venue = order.venue as any || {}
    const dates = order.dates as string[] || []

    const orderData: OrderConfirmationData = {
      orderNumber: order.orderNumber,
      eventName: order.eventName,
      dates,
      venue: {
        name: venue.name || '',
        street: venue.street,
        city: venue.city,
        postalCode: venue.postalCode,
      },
      items: order.items.map((item) => {
        const name = item.performance?.title || item.game?.title || item.service?.title || 'Polozka'
        return {
          name,
          date: item.date || undefined,
          startTime: item.startTime || undefined,
          endTime: item.endTime || undefined,
          price: item.price || 0,
        }
      }),
      pricing: {
        subtotal: pricing.subtotal,
        travelCosts: pricing.travelCosts,
        discount: pricing.discount,
        totalPrice: pricing.totalPrice || 0,
        vatIncluded: pricing.vatIncluded,
      },
      customer: {
        firstName: customer?.firstName || '',
        lastName: customer?.lastName || '',
        organization: customer?.organization || undefined,
      },
    }

    return NextResponse.json({
      success: true,
      status: 'pending' as ConfirmationStatus,
      order: orderData,
    })
  } catch (error) {
    console.error('Error fetching order for confirmation:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Chyba pri nacitani objednavky',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/orders/confirm/[token]
 * Confirm or reject order offer
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params
    const body = await request.json()

    const { action, agreedToTerms, confirmerName, confirmerEmail, comments } = body

    // Validate action
    if (!action || !['confirm', 'reject'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Neplatna akce' },
        { status: 400 }
      )
    }

    // Find order by token
    const order = await prisma.order.findUnique({
      where: { confirmationToken: token },
    })

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Objednavka nenalezena' },
        { status: 404 }
      )
    }

    // Check if already confirmed
    if (order.status === 'confirmed' || order.confirmedAt) {
      return NextResponse.json(
        { success: false, error: 'Objednavka uz byla potvrzena' },
        { status: 400 }
      )
    }

    // Check if token expired
    if (order.confirmationTokenExp && new Date() > order.confirmationTokenExp) {
      return NextResponse.json(
        { success: false, error: 'Platnost odkazu vyprsela' },
        { status: 400 }
      )
    }

    // Get customer from Prisma (customer is optional)
    const customer = order.customerId
      ? await prisma.customer.findUnique({
          where: { id: order.customerId },
        })
      : null
    const customerName = customer
      ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim()
      : 'Neznamy zakaznik'

    const baseUrl = getBaseUrl()
    const adminUrl = `${baseUrl}/admin/orders/${order.id}`

    if (action === 'confirm') {
      // Validate confirmation requirements
      if (!agreedToTerms) {
        return NextResponse.json(
          { success: false, error: 'Musite potvrdit souhlas s podminkami' },
          { status: 400 }
        )
      }

      if (!confirmerName || !confirmerEmail) {
        return NextResponse.json(
          { success: false, error: 'Vyplnte prosim sve jmeno a email' },
          { status: 400 }
        )
      }

      // Update order to confirmed status
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'confirmed',
          confirmedAt: new Date(),
          confirmedByName: confirmerName,
          confirmedByEmail: confirmerEmail,
          confirmationToken: null, // Clear token after use
          confirmationTokenExp: null,
        },
      })

      // Send notification to admin
      const notificationData = {
        orderNumber: order.orderNumber,
        eventName: order.eventName || '',
        customerName,
        customerOrganization: customer?.organization || undefined,
        confirmedByName: confirmerName,
        confirmedByEmail: confirmerEmail,
        confirmedAt: new Date(),
        adminUrl,
      }

      await sendEmail({
        to: getAdminEmail(),
        subject: getConfirmationNotificationSubject(order.orderNumber, order.eventName || ''),
        html: generateConfirmationNotificationHtml(notificationData),
        text: generateConfirmationNotificationText(notificationData),
      })

      // Log communication
      await prisma.communication.create({
        data: {
          type: 'email',
          direction: 'incoming',
          subject: 'Objednavka potvrzena zakaznikem',
          content: `Zakaznik ${confirmerName} (${confirmerEmail}) potvrdil objednavku`,
          customerId: order.customerId,
          orderId: order.id,
        },
      })

      return NextResponse.json({
        success: true,
        message: 'Objednavka byla uspesne potvrzena',
        status: 'confirmed',
      })
    } else if (action === 'reject') {
      // Validate rejection requirements
      if (!comments || comments.trim().length === 0) {
        return NextResponse.json(
          { success: false, error: 'Vyplnte prosim sve pripominky' },
          { status: 400 }
        )
      }

      // Update order to reviewing status with comments
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'reviewing',
          customerComments: comments.trim(),
          confirmationToken: null, // Clear token after use
          confirmationTokenExp: null,
        },
      })

      // Send notification to admin
      const rejectionNotificationData = {
        orderNumber: order.orderNumber,
        eventName: order.eventName || '',
        customerName,
        customerOrganization: customer?.organization || undefined,
        customerComments: comments.trim(),
        submittedAt: new Date(),
        adminUrl,
      }

      await sendEmail({
        to: getAdminEmail(),
        subject: getRejectionNotificationSubject(order.orderNumber, order.eventName || ''),
        html: generateRejectionNotificationHtml(rejectionNotificationData),
        text: generateRejectionNotificationText(rejectionNotificationData),
      })

      // Log communication
      await prisma.communication.create({
        data: {
          type: 'email',
          direction: 'incoming',
          subject: 'Pripominky k objednavce od zakaznika',
          content: comments.trim(),
          customerId: order.customerId,
          orderId: order.id,
        },
      })

      return NextResponse.json({
        success: true,
        message: 'Pripominky byly odeslany, budeme vas kontaktovat',
        status: 'reviewing',
      })
    }

    return NextResponse.json(
      { success: false, error: 'Neplatna akce' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error processing confirmation:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Chyba pri zpracovani',
      },
      { status: 500 }
    )
  }
}
