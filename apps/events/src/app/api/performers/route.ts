import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const createPerformerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  stageName: z.string().optional(),
  type: z.enum(['fire', 'magic', 'circus', 'music', 'dance', 'comedy', 'interactive']),
  bio: z.string().optional(),
  specialties: z.array(z.string()).default([]),
  setupTime: z.number().default(30),
  performanceTime: z.number().default(30),
  breakdownTime: z.number().default(15),
  requirements: z.any().optional(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  website: z.string().url().optional().nullable(),
  standardRate: z.number().optional().nullable(),
})

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')

    const performers = await prisma.performer.findMany({
      where: {
        tenantId: session.user.tenantId,
        ...(type && { type }),
      },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { bookings: true },
        },
      },
    })

    return NextResponse.json({ performers })
  } catch (error) {
    console.error('Error fetching performers:', error)
    return NextResponse.json({ error: 'Error fetching performers' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const data = createPerformerSchema.parse(body)

    const performer = await prisma.performer.create({
      data: {
        tenantId: session.user.tenantId,
        name: data.name,
        stageName: data.stageName,
        type: data.type,
        bio: data.bio,
        specialties: data.specialties,
        setupTime: data.setupTime,
        performanceTime: data.performanceTime,
        breakdownTime: data.breakdownTime,
        requirements: data.requirements,
        email: data.email,
        phone: data.phone,
        website: data.website,
        standardRate: data.standardRate,
      },
    })

    return NextResponse.json({ performer }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating performer:', error)
    return NextResponse.json({ error: 'Error creating performer' }, { status: 500 })
  }
}
