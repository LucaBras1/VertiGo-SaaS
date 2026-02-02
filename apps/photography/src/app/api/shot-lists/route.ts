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

    const shotLists = await prisma.shotList.findMany({
      where: {
        tenantId: session.user.tenantId
      },
      include: {
        package: {
          include: {
            client: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(shotLists)
  } catch (error) {
    console.error('GET /api/shot-lists error:', error)
    return NextResponse.json({ error: 'Failed to fetch shot lists' }, { status: 500 })
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
      name,
      eventType,
      sections,
      totalShots,
      mustHaveCount,
      estimatedTime,
      equipmentList,
      lightingPlan,
      backupPlans,
      aiGenerated
    } = body

    if (!name || !eventType || !sections) {
      return NextResponse.json(
        { error: 'Name, event type, and sections are required' },
        { status: 400 }
      )
    }

    const shotList = await prisma.shotList.create({
      data: {
        tenantId: session.user.tenantId,
        packageId,
        name,
        eventType,
        status: 'DRAFT',
        sections,
        totalShots: totalShots || 0,
        mustHaveCount: mustHaveCount || 0,
        estimatedTime,
        equipmentList,
        lightingPlan,
        backupPlans,
        aiGenerated: aiGenerated || false
      }
    })

    return NextResponse.json(shotList, { status: 201 })
  } catch (error) {
    console.error('POST /api/shot-lists error:', error)
    return NextResponse.json({ error: 'Failed to create shot list' }, { status: 500 })
  }
}
