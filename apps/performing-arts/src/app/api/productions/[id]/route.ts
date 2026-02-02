import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateProductionSchema = z.object({
  name: z.string().min(1).optional(),
  type: z
    .enum([
      'THEATER',
      'DANCE',
      'CIRCUS',
      'MUSICAL',
      'OPERA',
      'COMEDY',
      'VARIETY',
      'KIDS_SHOW',
      'CONCERT',
      'OTHER',
    ])
    .optional(),
  status: z
    .enum([
      'PLANNING',
      'PRE_PRODUCTION',
      'REHEARSING',
      'TECH_WEEK',
      'RUNNING',
      'CLOSED',
      'ARCHIVED',
    ])
    .optional(),
  synopsis: z.string().optional().nullable(),
  tagline: z.string().optional().nullable(),
  duration: z.number().optional().nullable(),
  hasIntermission: z.boolean().optional(),
  intermissionLength: z.number().optional().nullable(),
  openingDate: z.string().optional().nullable(),
  closingDate: z.string().optional().nullable(),
  director: z.string().optional().nullable(),
  playwright: z.string().optional().nullable(),
  choreographer: z.string().optional().nullable(),
  musicalDirector: z.string().optional().nullable(),
  setDesigner: z.string().optional().nullable(),
  costumeDesigner: z.string().optional().nullable(),
  lightingDesigner: z.string().optional().nullable(),
  soundDesigner: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
})

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const production = await prisma.production.findFirst({
      where: {
        id: params.id,
        tenantId: session.user.tenantId,
      },
      include: {
        performances: {
          orderBy: { date: 'asc' },
          take: 10,
        },
        castMembers: {
          orderBy: { characterName: 'asc' },
        },
        crewMembers: {
          orderBy: { department: 'asc' },
        },
        rehearsals: {
          orderBy: { date: 'asc' },
          take: 10,
        },
        techRider: true,
        scenes: {
          orderBy: [{ act: 'asc' }, { number: 'asc' }],
        },
        _count: {
          select: {
            performances: true,
            castMembers: true,
            crewMembers: true,
            rehearsals: true,
          },
        },
      },
    })

    if (!production) {
      return NextResponse.json({ error: 'Production not found' }, { status: 404 })
    }

    return NextResponse.json(production)
  } catch (error) {
    console.error('Error fetching production:', error)
    return NextResponse.json(
      { error: 'Failed to fetch production' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify production belongs to tenant
    const existing = await prisma.production.findFirst({
      where: {
        id: params.id,
        tenantId: session.user.tenantId,
      },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Production not found' }, { status: 404 })
    }

    const body = await request.json()
    const data = updateProductionSchema.parse(body)

    const production = await prisma.production.update({
      where: { id: params.id },
      data: {
        ...data,
        openingDate: data.openingDate ? new Date(data.openingDate) : data.openingDate,
        closingDate: data.closingDate ? new Date(data.closingDate) : data.closingDate,
      },
    })

    return NextResponse.json(production)
  } catch (error) {
    console.error('Error updating production:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update production' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify production belongs to tenant
    const existing = await prisma.production.findFirst({
      where: {
        id: params.id,
        tenantId: session.user.tenantId,
      },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Production not found' }, { status: 404 })
    }

    await prisma.production.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting production:', error)
    return NextResponse.json(
      { error: 'Failed to delete production' },
      { status: 500 }
    )
  }
}
