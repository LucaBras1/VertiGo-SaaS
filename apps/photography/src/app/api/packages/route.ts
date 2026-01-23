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
    const status = searchParams.get('status')

    const packages = await prisma.package.findMany({
      where: {
        tenantId: session.user.tenantId,
        ...(status && { status: status as any })
      },
      include: {
        client: true,
        shoots: true,
        invoices: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(packages)
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
