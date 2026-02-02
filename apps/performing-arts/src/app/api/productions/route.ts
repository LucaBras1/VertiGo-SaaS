import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createProductionSchema = z.object({
  name: z.string().min(1),
  type: z.enum([
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
  ]),
  synopsis: z.string().optional(),
  tagline: z.string().optional(),
  duration: z.number().optional(),
  hasIntermission: z.boolean().default(false),
  intermissionLength: z.number().optional(),
  openingDate: z.string().optional(),
  closingDate: z.string().optional(),
  director: z.string().optional(),
  playwright: z.string().optional(),
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const productions = await prisma.production.findMany({
      where: { tenantId: session.user.tenantId },
      orderBy: { updatedAt: 'desc' },
      include: {
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

    return NextResponse.json(productions)
  } catch (error) {
    console.error('Error fetching productions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch productions' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = createProductionSchema.parse(body)

    const production = await prisma.production.create({
      data: {
        tenantId: session.user.tenantId,
        name: data.name,
        type: data.type,
        synopsis: data.synopsis,
        tagline: data.tagline,
        duration: data.duration,
        hasIntermission: data.hasIntermission,
        intermissionLength: data.intermissionLength,
        openingDate: data.openingDate ? new Date(data.openingDate) : null,
        closingDate: data.closingDate ? new Date(data.closingDate) : null,
        director: data.director,
        playwright: data.playwright,
      },
    })

    return NextResponse.json(production, { status: 201 })
  } catch (error) {
    console.error('Error creating production:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create production' },
      { status: 500 }
    )
  }
}
