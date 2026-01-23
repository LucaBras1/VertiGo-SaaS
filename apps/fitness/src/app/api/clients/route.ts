import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const clientCreateSchema = z.object({
  name: z.string().min(2, 'Jméno musí mít alespoň 2 znaky'),
  email: z.string().email('Neplatný email'),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  goals: z.array(z.string()).optional(),
  currentWeight: z.number().optional(),
  targetWeight: z.number().optional(),
  height: z.number().optional(),
  fitnessLevel: z.string().optional(),
  injuryHistory: z.string().optional(),
  dietaryNotes: z.string().optional(),
  medicalNotes: z.string().optional(),
  membershipType: z.string().optional(),
  creditsRemaining: z.number().optional(),
  membershipExpiry: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

// GET /api/clients - List clients
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const fitnessLevel = searchParams.get('fitnessLevel') || ''
    const includeMeasurements = searchParams.get('includeMeasurements') === 'true'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where = {
      tenantId: session.user.tenantId,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
          { phone: { contains: search } },
        ],
      }),
      ...(status && { status }),
      ...(fitnessLevel && { fitnessLevel }),
    }

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          _count: {
            select: { sessions: true },
          },
          ...(includeMeasurements && {
            measurements: {
              orderBy: { date: 'desc' },
            },
          }),
        },
      }),
      prisma.client.count({ where }),
    ])

    return NextResponse.json({
      clients,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching clients:', error)
    return NextResponse.json({ error: 'Chyba při načítání klientů' }, { status: 500 })
  }
}

// POST /api/clients - Create client
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const data = clientCreateSchema.parse(body)

    // Check if client with email already exists for this tenant
    const existingClient = await prisma.client.findFirst({
      where: {
        tenantId: session.user.tenantId,
        email: data.email,
      },
    })

    if (existingClient) {
      return NextResponse.json(
        { error: 'Klient s tímto emailem již existuje' },
        { status: 400 }
      )
    }

    const client = await prisma.client.create({
      data: {
        tenantId: session.user.tenantId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        gender: data.gender,
        goals: data.goals || [],
        currentWeight: data.currentWeight,
        targetWeight: data.targetWeight,
        height: data.height,
        fitnessLevel: data.fitnessLevel,
        injuryHistory: data.injuryHistory,
        dietaryNotes: data.dietaryNotes,
        medicalNotes: data.medicalNotes,
        membershipType: data.membershipType,
        creditsRemaining: data.creditsRemaining || 0,
        membershipExpiry: data.membershipExpiry ? new Date(data.membershipExpiry) : undefined,
        notes: data.notes,
        tags: data.tags || [],
        status: 'active',
      },
    })

    return NextResponse.json(client, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Neplatná data', details: error.errors }, { status: 400 })
    }
    console.error('Error creating client:', error)
    return NextResponse.json({ error: 'Chyba při vytváření klienta' }, { status: 500 })
  }
}
