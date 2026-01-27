import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)

    // Pagination
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const skip = (page - 1) * limit

    // Filters
    const status = searchParams.get('status')
    const statuses = searchParams.get('statuses')?.split(',').filter(Boolean)
    const clientId = searchParams.get('clientId')
    const eventType = searchParams.get('eventType')
    const search = searchParams.get('search')

    // Date range filters
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    // Sorting
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc'

    // Build where clause
    const where: any = {
      tenantId: session.user.tenantId
    }

    // Status filter (single or multiple)
    if (status) {
      where.status = status
    } else if (statuses && statuses.length > 0) {
      where.status = { in: statuses }
    }

    // Client filter
    if (clientId) {
      where.clientId = clientId
    }

    // Event type filter
    if (eventType) {
      where.eventType = eventType
    }

    // Date range filter
    if (dateFrom || dateTo) {
      where.eventDate = {}
      if (dateFrom) {
        where.eventDate.gte = new Date(dateFrom)
      }
      if (dateTo) {
        where.eventDate.lte = new Date(dateTo)
      }
    }

    // Search filter (title or client name)
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { client: { name: { contains: search, mode: 'insensitive' } } },
        { client: { email: { contains: search, mode: 'insensitive' } } }
      ]
    }

    // Build orderBy
    const orderBy: any = {}
    const allowedSortFields = ['createdAt', 'eventDate', 'title', 'status', 'totalPrice']
    if (allowedSortFields.includes(sortBy)) {
      orderBy[sortBy] = sortOrder
    } else {
      orderBy.createdAt = 'desc'
    }

    // Execute queries in parallel
    const [packages, totalCount] = await Promise.all([
      prisma.package.findMany({
        where,
        include: {
          client: true,
          shoots: {
            orderBy: { date: 'asc' }
          },
          invoices: {
            orderBy: { createdAt: 'desc' }
          },
          shotLists: {
            select: { id: true }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.package.count({ where })
    ])

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit)
    const hasMore = page < totalPages

    return NextResponse.json({
      data: packages,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasMore
      }
    })
  } catch (error) {
    console.error('GET /api/packages error:', error)
    return NextResponse.json({ error: 'Failed to fetch packages' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const {
      clientId,
      title,
      eventType,
      eventDate,
      shotCount,
      deliveryDays,
      editingHours,
      styleTags,
      equipment,
      secondShooter,
      rawFilesIncluded,
      timeline,
      basePrice,
      travelCosts,
      totalPrice,
      notes
    } = body

    if (!clientId || !title) {
      return NextResponse.json(
        { error: 'Client ID and title are required' },
        { status: 400 }
      )
    }

    const package_ = await prisma.package.create({
      data: {
        tenantId: session.user.tenantId,
        clientId,
        title,
        status: 'INQUIRY',
        eventType,
        eventDate: eventDate ? new Date(eventDate) : null,
        shotCount,
        deliveryDays,
        editingHours,
        styleTags: styleTags || [],
        equipment: equipment || [],
        secondShooter: secondShooter || false,
        rawFilesIncluded: rawFilesIncluded || false,
        timeline,
        basePrice,
        travelCosts,
        totalPrice,
        notes
      },
      include: {
        client: true
      }
    })

    return NextResponse.json(package_, { status: 201 })
  } catch (error) {
    console.error('POST /api/packages error:', error)
    return NextResponse.json({ error: 'Failed to create package' }, { status: 500 })
  }
}
