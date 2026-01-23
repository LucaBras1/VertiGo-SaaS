import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const clientUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  goals: z.array(z.string()).optional(),
  currentWeight: z.number().optional().nullable(),
  targetWeight: z.number().optional().nullable(),
  height: z.number().optional().nullable(),
  fitnessLevel: z.string().optional().nullable(),
  injuryHistory: z.string().optional().nullable(),
  dietaryNotes: z.string().optional().nullable(),
  medicalNotes: z.string().optional().nullable(),
  membershipType: z.string().optional().nullable(),
  creditsRemaining: z.number().optional(),
  membershipExpiry: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['active', 'inactive', 'paused']).optional(),
})

// GET /api/clients/[id]
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const client = await prisma.client.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
      include: {
        sessions: {
          orderBy: { scheduledAt: 'desc' },
          take: 10,
        },
        measurements: {
          orderBy: { date: 'desc' },
          take: 10,
        },
        progressPhotos: {
          orderBy: { date: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            sessions: true,
            orders: true,
            invoices: true,
          },
        },
      },
    })

    if (!client) {
      return NextResponse.json({ error: 'Klient nenalezen' }, { status: 404 })
    }

    return NextResponse.json(client)
  } catch (error) {
    console.error('Error fetching client:', error)
    return NextResponse.json({ error: 'Chyba při načítání klienta' }, { status: 500 })
  }
}

// PATCH /api/clients/[id]
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const data = clientUpdateSchema.parse(body)

    // Check if client exists and belongs to tenant
    const existingClient = await prisma.client.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
    })

    if (!existingClient) {
      return NextResponse.json({ error: 'Klient nenalezen' }, { status: 404 })
    }

    // If email is being changed, check for duplicates
    if (data.email && data.email !== existingClient.email) {
      const emailExists = await prisma.client.findFirst({
        where: {
          tenantId: session.user.tenantId,
          email: data.email,
          NOT: { id },
        },
      })

      if (emailExists) {
        return NextResponse.json(
          { error: 'Klient s tímto emailem již existuje' },
          { status: 400 }
        )
      }
    }

    const client = await prisma.client.update({
      where: { id },
      data: {
        ...data,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : data.dateOfBirth === null ? null : undefined,
        membershipExpiry: data.membershipExpiry ? new Date(data.membershipExpiry) : data.membershipExpiry === null ? null : undefined,
      },
    })

    return NextResponse.json(client)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Neplatná data', details: error.errors }, { status: 400 })
    }
    console.error('Error updating client:', error)
    return NextResponse.json({ error: 'Chyba při aktualizaci klienta' }, { status: 500 })
  }
}

// DELETE /api/clients/[id]
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Check if client exists and belongs to tenant
    const existingClient = await prisma.client.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
    })

    if (!existingClient) {
      return NextResponse.json({ error: 'Klient nenalezen' }, { status: 404 })
    }

    await prisma.client.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting client:', error)
    return NextResponse.json({ error: 'Chyba při mazání klienta' }, { status: 500 })
  }
}
