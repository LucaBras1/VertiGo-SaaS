import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const updateClientSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().nullable().optional(),
  company: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  clientType: z.enum(['individual', 'corporate']).optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().nullable().optional(),
})

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
        events: {
          select: { id: true, name: true, date: true, type: true, status: true },
          orderBy: { date: 'desc' },
          take: 10,
        },
      },
    })

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    return NextResponse.json({ client })
  } catch (error) {
    console.error('Error fetching client:', error)
    return NextResponse.json({ error: 'Error fetching client' }, { status: 500 })
  }
}

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

    const existingClient = await prisma.client.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
    })

    if (!existingClient) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const body = await req.json()
    const data = updateClientSchema.parse(body)

    // Check for email uniqueness if updating email
    if (data.email && data.email !== existingClient.email) {
      const emailExists = await prisma.client.findFirst({
        where: {
          tenantId: session.user.tenantId,
          email: data.email,
          id: { not: id },
        },
      })

      if (emailExists) {
        return NextResponse.json(
          { error: 'Another client with this email already exists' },
          { status: 400 }
        )
      }
    }

    const client = await prisma.client.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.company !== undefined && { company: data.company }),
        ...(data.address !== undefined && { address: data.address }),
        ...(data.city !== undefined && { city: data.city }),
        ...(data.clientType !== undefined && { clientType: data.clientType }),
        ...(data.tags !== undefined && { tags: data.tags }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
    })

    return NextResponse.json({ client })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating client:', error)
    return NextResponse.json({ error: 'Error updating client' }, { status: 500 })
  }
}

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

    const existingClient = await prisma.client.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
    })

    if (!existingClient) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Check for upcoming events with this client
    const upcomingEvents = await prisma.event.count({
      where: {
        clientId: id,
        date: { gte: new Date() },
        status: { in: ['planning', 'confirmed'] },
      },
    })

    if (upcomingEvents > 0) {
      return NextResponse.json(
        { error: 'Cannot delete client with upcoming events' },
        { status: 400 }
      )
    }

    await prisma.client.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting client:', error)
    return NextResponse.json({ error: 'Error deleting client' }, { status: 500 })
  }
}
