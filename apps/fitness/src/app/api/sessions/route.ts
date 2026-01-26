import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendSessionReminderEmail } from '@/lib/email'
import { format } from 'date-fns'
import { cs } from 'date-fns/locale'

const sessionCreateSchema = z.object({
  clientId: z.string().min(1, 'Vyberte klienta'),
  scheduledAt: z.string().min(1, 'Zadejte datum a čas'),
  duration: z.number().int().min(15).max(180).default(60),
  muscleGroups: z.array(z.string()).optional(),
  price: z.number().optional(),
  notes: z.string().optional(),
})

// GET /api/sessions
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const clientId = searchParams.get('clientId')
    const status = searchParams.get('status')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    const where = {
      tenantId: session.user.tenantId,
      ...(clientId && { clientId }),
      ...(status && { status }),
      ...(startDate && endDate && {
        scheduledAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      }),
    }

    const [sessions, total] = await Promise.all([
      prisma.session.findMany({
        where,
        orderBy: { scheduledAt: 'asc' },
        skip,
        take: limit,
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              creditsRemaining: true,
            },
          },
        },
      }),
      prisma.session.count({ where }),
    ])

    return NextResponse.json({
      sessions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching sessions:', error)
    return NextResponse.json({ error: 'Chyba při načítání sessions' }, { status: 500 })
  }
}

// POST /api/sessions
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const data = sessionCreateSchema.parse(body)

    // Verify client belongs to tenant
    const client = await prisma.client.findFirst({
      where: {
        id: data.clientId,
        tenantId: session.user.tenantId,
      },
    })

    if (!client) {
      return NextResponse.json({ error: 'Klient nenalezen' }, { status: 404 })
    }

    const newSession = await prisma.session.create({
      data: {
        tenantId: session.user.tenantId,
        clientId: data.clientId,
        scheduledAt: new Date(data.scheduledAt),
        duration: data.duration,
        muscleGroups: data.muscleGroups || [],
        price: data.price,
        trainerNotes: data.notes,
        status: 'scheduled',
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    // Send confirmation email to client
    try {
      const scheduledDate = new Date(data.scheduledAt)
      const tenant = await prisma.tenant.findUnique({
        where: { id: session.user.tenantId },
      })

      await sendSessionReminderEmail({
        to: client.email,
        clientName: client.name,
        trainerName: tenant?.name || 'Váš trenér',
        sessionDate: format(scheduledDate, 'd. MMMM yyyy', { locale: cs }),
        sessionTime: format(scheduledDate, 'HH:mm'),
        duration: data.duration,
        location: undefined,
      })
    } catch (emailError) {
      // Log email error but don't fail the request
      console.error('Failed to send session confirmation email:', emailError)
    }

    return NextResponse.json(newSession, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Neplatná data', details: error.errors }, { status: 400 })
    }
    console.error('Error creating session:', error)
    return NextResponse.json({ error: 'Chyba při vytváření session' }, { status: 500 })
  }
}
