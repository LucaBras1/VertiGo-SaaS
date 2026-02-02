import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const createClientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  company: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  clientType: z.enum(['individual', 'corporate']).default('individual'),
  tags: z.array(z.string()).default([]),
  notes: z.string().optional(),
})

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const clientType = searchParams.get('type')
    const search = searchParams.get('search')
    const tenantId = session.user.tenantId

    const clients = await prisma.client.findMany({
      where: {
        tenantId,
        ...(clientType && { clientType }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { company: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { events: true },
        },
        events: {
          select: {
            date: true,
            totalBudget: true,
            status: true,
          },
          orderBy: { date: 'desc' },
        },
      },
    })

    // Add computed fields for each client
    const now = new Date()
    const clientsWithStats = clients.map((client) => {
      const pastEvents = client.events.filter((e) => new Date(e.date) < now)
      const futureEvents = client.events.filter((e) => new Date(e.date) >= now)

      return {
        ...client,
        events: undefined, // Don't expose full events array in list
        totalEvents: client.events.length,
        upcomingEvents: futureEvents.length,
        totalRevenue: pastEvents.reduce(
          (sum, e) => sum + Number(e.totalBudget || 0),
          0
        ),
        lastEvent: pastEvents[0]?.date
          ? new Date(pastEvents[0].date).toISOString()
          : null,
        nextEvent: futureEvents.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        )[0]?.date
          ? new Date(
              futureEvents.sort(
                (a, b) =>
                  new Date(a.date).getTime() - new Date(b.date).getTime()
              )[0].date
            ).toISOString()
          : null,
      }
    })

    return NextResponse.json({ clients: clientsWithStats })
  } catch (error) {
    console.error('Error fetching clients:', error)
    return NextResponse.json({ error: 'Error fetching clients' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const data = createClientSchema.parse(body)

    // Check for existing client with same email in tenant
    const existingClient = await prisma.client.findFirst({
      where: {
        tenantId: session.user.tenantId,
        email: data.email,
      },
    })

    if (existingClient) {
      return NextResponse.json(
        { error: 'Client with this email already exists' },
        { status: 400 }
      )
    }

    const client = await prisma.client.create({
      data: {
        tenantId: session.user.tenantId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        address: data.address,
        city: data.city,
        clientType: data.clientType,
        tags: data.tags,
        notes: data.notes,
      },
    })

    return NextResponse.json({ client }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating client:', error)
    return NextResponse.json({ error: 'Error creating client' }, { status: 500 })
  }
}
