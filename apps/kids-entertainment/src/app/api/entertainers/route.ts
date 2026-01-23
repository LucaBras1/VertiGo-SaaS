/**
 * Entertainers API Routes
 * GET /api/entertainers - List all entertainers
 * POST /api/entertainers - Create new entertainer
 */

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
    const isActive = searchParams.get('isActive')

    const where: any = {}
    if (isActive !== null) where.isActive = isActive === 'true'

    const entertainers = await prisma.entertainer.findMany({
      where,
      orderBy: {
        lastName: 'asc',
      },
    })

    return NextResponse.json(entertainers)
  } catch (error) {
    console.error('Error fetching entertainers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch entertainers' },
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

    const entertainer = await prisma.entertainer.create({
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        stageName: body.stageName,
        role: body.role,
        bio: body.bio,
        photoUrl: body.photoUrl,
        photoAlt: body.photoAlt,
        email: body.email,
        phone: body.phone,
        specializations: body.specializations || [],
        ageGroups: body.ageGroups || [],
        languages: body.languages || [],
        backgroundCheckDate: body.backgroundCheckDate
          ? new Date(body.backgroundCheckDate)
          : undefined,
        backgroundCheckStatus: body.backgroundCheckStatus,
        firstAidCertified: body.firstAidCertified || false,
        firstAidExpiryDate: body.firstAidExpiryDate
          ? new Date(body.firstAidExpiryDate)
          : undefined,
        insuranceNumber: body.insuranceNumber,
        insuranceExpiryDate: body.insuranceExpiryDate
          ? new Date(body.insuranceExpiryDate)
          : undefined,
        isActive: body.isActive !== false,
      },
    })

    return NextResponse.json(entertainer, { status: 201 })
  } catch (error) {
    console.error('Error creating entertainer:', error)
    return NextResponse.json(
      { error: 'Failed to create entertainer' },
      { status: 500 }
    )
  }
}
