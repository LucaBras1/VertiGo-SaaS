/**
 * Parties API Routes
 * GET /api/parties - List all parties with filtering
 * POST /api/parties - Create new party
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const dateFilter = searchParams.get('dateFilter')

    const where: any = {}
    if (status) where.status = status

    const now = new Date()
    if (dateFilter === 'upcoming') {
      where.date = { gte: now }
    } else if (dateFilter === 'past') {
      where.date = { lt: now }
    }

    const parties = await prisma.party.findMany({
      where,
      include: {
        package: {
          select: {
            title: true,
          },
        },
        activity: {
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        date: dateFilter === 'past' ? 'desc' : 'asc',
      },
    })

    return NextResponse.json(parties)
  } catch (error) {
    console.error('Error fetching parties:', error)
    return NextResponse.json(
      { error: 'Failed to fetch parties' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const party = await prisma.party.create({
      data: {
        packageId: body.packageId,
        activityId: body.activityId,
        date: new Date(body.date),
        endDate: body.endDate ? new Date(body.endDate) : undefined,
        venue: body.venue,
        childName: body.childName,
        childAge: body.childAge,
        childGender: body.childGender,
        childInterests: body.childInterests || [],
        guestCount: body.guestCount,
        theme: body.theme,
        specialRequests: body.specialRequests,
        allergies: body.allergies || [],
        dietaryRestrictions: body.dietaryRestrictions || [],
        specialNeeds: body.specialNeeds,
        emergencyContact: body.emergencyContact,
        parentName: body.parentName,
        parentPhone: body.parentPhone,
        parentEmail: body.parentEmail,
        status: body.status || 'inquiry',
      },
    })

    return NextResponse.json(party, { status: 201 })
  } catch (error) {
    console.error('Error creating party:', error)
    return NextResponse.json(
      { error: 'Failed to create party' },
      { status: 500 }
    )
  }
}
