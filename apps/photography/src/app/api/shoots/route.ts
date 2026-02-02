import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Force dynamic to avoid build-time Prisma proxy issues
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const shoots = await prisma.shoot.findMany({
      where: {
        tenantId: session.user.tenantId
      },
      include: {
        package: {
          include: {
            client: true
          }
        },
        shotList: true
      },
      orderBy: {
        date: 'desc'
      }
    })

    return NextResponse.json(shoots)
  } catch (error) {
    console.error('GET /api/shoots error:', error)
    return NextResponse.json({ error: 'Failed to fetch shoots' }, { status: 500 })
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
      packageId,
      date,
      startTime,
      endTime,
      shotListId,
      timeline,
      locations,
      sunsetTime,
      weatherForecast,
      venueType,
      venueName,
      venueAddress,
      lightingNotes,
      notes
    } = body

    if (!packageId || !date || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Package ID, date, start time, and end time are required' },
        { status: 400 }
      )
    }

    const shoot = await prisma.shoot.create({
      data: {
        tenantId: session.user.tenantId,
        packageId,
        date: new Date(date),
        startTime,
        endTime,
        shotListId,
        timeline,
        locations: locations || [],
        sunsetTime: sunsetTime ? new Date(sunsetTime) : null,
        weatherForecast,
        venueType,
        venueName,
        venueAddress,
        lightingNotes,
        notes
      },
      include: {
        package: {
          include: {
            client: true
          }
        }
      }
    })

    return NextResponse.json(shoot, { status: 201 })
  } catch (error) {
    console.error('POST /api/shoots error:', error)
    return NextResponse.json({ error: 'Failed to create shoot' }, { status: 500 })
  }
}
