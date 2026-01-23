// API Route: /api/admin/orders
// CRUD operations for orders

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendOrderOffer, validateCustomerForOffer } from '@/lib/orders/send-offer'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/orders
 * Get all orders with optional filtering and pagination
 * Query params: page, pageSize, status, dateFrom, dateTo, customerId, search, minPrice, maxPrice, hasInvoice, city
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    // Pagination params
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '25')
    const skip = (page - 1) * pageSize

    // Filter params
    const statusFilter = searchParams.getAll('status')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const customerId = searchParams.get('customerId')
    const search = searchParams.get('search') || undefined
    const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined
    const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined
    const hasInvoiceParam = searchParams.get('hasInvoice')
    const hasInvoice = hasInvoiceParam === 'true' ? true : hasInvoiceParam === 'false' ? false : undefined
    const city = searchParams.get('city') || undefined

    // Build where clause
    const where: any = {}

    if (statusFilter.length > 0) {
      where.status = { in: statusFilter }
    }

    if (customerId) {
      where.customerId = customerId
    }

    // Search filter - search in orderNumber, eventName, and customer fields
    // Note: SQLite doesn't support case-insensitive mode
    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { eventName: { contains: search } },
        { customer: { firstName: { contains: search } } },
        { customer: { lastName: { contains: search } } },
        { customer: { email: { contains: search } } },
        { customer: { phone: { contains: search } } },
        { customer: { ico: { contains: search } } },
        { customer: { organization: { contains: search } } },
      ]
    }

    // Has invoice filter
    if (hasInvoice !== undefined) {
      if (hasInvoice) {
        where.invoiceId = { not: null }
      } else {
        where.invoiceId = null
      }
    }

    // Get total count
    const totalItems = await prisma.order.count({ where })

    // Get paginated orders with optimized selects (only needed fields)
    let orders = await prisma.order.findMany({
      where,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        eventName: true,
        dates: true,
        venue: true,
        pricing: true,
        createdAt: true,
        updatedAt: true,
        customerId: true,
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            organization: true,
          },
        },
        items: {
          select: {
            id: true,
            date: true,
            startTime: true,
            price: true,
            performance: {
              select: { id: true, title: true, slug: true },
            },
            game: {
              select: { id: true, title: true, slug: true },
            },
            service: {
              select: { id: true, title: true, slug: true },
            },
          },
        },
        _count: {
          select: { invoices: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: pageSize,
    })

    // Client-side filtering for JSON fields (pricing, venue)
    let filteredOrders = orders

    // Price range filter (pricing is JSON field)
    if (minPrice !== undefined || maxPrice !== undefined) {
      filteredOrders = filteredOrders.filter((order) => {
        const price = (order.pricing as any)?.totalPrice || 0
        if (minPrice !== undefined && price < minPrice) return false
        if (maxPrice !== undefined && price > maxPrice) return false
        return true
      })
    }

    // City filter (venue is JSON field)
    if (city) {
      const cityLower = city.toLowerCase()
      filteredOrders = filteredOrders.filter((order) => {
        const venueCity = (order.venue as any)?.city || ''
        return venueCity.toLowerCase().includes(cityLower)
      })
    }

    // Date range filter (dates is JSON array field)
    if (dateFrom || dateTo) {
      filteredOrders = filteredOrders.filter((order) => {
        const dates = order.dates as string[] | null
        if (!dates || dates.length === 0) return false

        // Check if any date falls within the range
        return dates.some((dateStr) => {
          const eventDate = new Date(dateStr).getTime()
          if (dateFrom) {
            const fromTime = new Date(dateFrom).getTime()
            if (eventDate < fromTime) return false
          }
          if (dateTo) {
            const toTime = new Date(dateTo).getTime()
            if (eventDate > toTime) return false
          }
          return true
        })
      })
    }

    // Use filtered count when client-side filters are applied
    const hasClientSideFilters = (minPrice !== undefined || maxPrice !== undefined || city || dateFrom || dateTo)
    const finalTotalItems = hasClientSideFilters ? filteredOrders.length : totalItems
    const totalPages = Math.ceil(finalTotalItems / pageSize) || 1

    return NextResponse.json({
      success: true,
      orders: filteredOrders,
      pagination: {
        currentPage: page,
        pageSize,
        totalItems: finalTotalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch orders',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/orders
 * Create new order
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.customerId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Customer ID is required',
        },
        { status: 400 }
      )
    }

    if (!body.dates || !Array.isArray(body.dates) || body.dates.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'At least one event date is required',
        },
        { status: 400 }
      )
    }

    if (!body.venue || !body.venue.name) {
      return NextResponse.json(
        {
          success: false,
          error: 'Venue information is required',
        },
        { status: 400 }
      )
    }

    // Validate customer has email (required for automatic offer sending)
    const customerValidation = await validateCustomerForOffer(body.customerId)
    if (!customerValidation.hasEmail) {
      return NextResponse.json(
        {
          success: false,
          error: customerValidation.error || 'Zakaznik nema email - nelze odeslat nabidku',
        },
        { status: 400 }
      )
    }

    // Generate order number (format: YYYY-NNN)
    const year = new Date().getFullYear()
    const orderCount = await prisma.order.count({
      where: {
        orderNumber: {
          startsWith: `${year}-`,
        },
      },
    })
    const orderNumber = `${year}-${String(orderCount + 1).padStart(3, '0')}`

    // Create order with items
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId: body.customerId,
        source: body.source || 'manual',
        status: 'new',
        eventName: body.eventName || null,
        dates: body.dates,
        venue: body.venue,
        arrivalTime: body.arrivalTime || null,
        preparationTime: body.preparationTime || null,
        eventDuration: body.eventDuration || null,
        technicalRequirements: body.technicalRequirements || null,
        pricing: body.pricing || null,
        // Payment & Invoicing
        paymentMethod: body.paymentMethod || null,
        paymentDueDate: body.paymentDueDate ? new Date(body.paymentDueDate) : null,
        invoiceEmail: body.invoiceEmail || null,
        // Logistics (internal use)
        logistics: body.logistics || null,
        contacts: body.contacts || null,
        documents: body.documents || null,
        contactMessage: body.contactMessage || null,
        internalNotes: body.internalNotes || null,
        items: {
          create: (body.items || []).map((item: any) => ({
            performanceId: item.performanceId || null,
            gameId: item.gameId || null,
            serviceId: item.serviceId || null,
            date: item.date,
            startTime: item.startTime || null,
            endTime: item.endTime || null,
            price: item.price || 0,
            notes: item.notes || null,
          })),
        },
      },
      include: {
        customer: true,
        items: {
          include: {
            performance: true,
            game: true,
            service: true,
          },
        },
      },
    })

    // Automatically send offer email to customer
    const offerResult = await sendOrderOffer(order.id, 'new')

    // Reload order to get updated status
    const updatedOrder = offerResult.success
      ? await prisma.order.findUnique({
          where: { id: order.id },
          include: {
            customer: true,
            items: {
              include: {
                performance: true,
                game: true,
                service: true,
              },
            },
          },
        })
      : order

    return NextResponse.json({
      success: true,
      data: updatedOrder,
      offerSent: offerResult.success,
      offerError: offerResult.error,
      confirmationUrl: offerResult.confirmationUrl,
      expiresAt: offerResult.expiresAt,
    })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create order',
      },
      { status: 500 }
    )
  }
}
