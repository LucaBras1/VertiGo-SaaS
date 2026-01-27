import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const slotSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  duration: z.number().min(15).max(180),
  type: z.enum(['session', 'class', 'break']),
  title: z.string().optional(),
  notes: z.string().optional(),
})

const templateUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  slots: z.array(slotSchema).optional(),
  isActive: z.boolean().optional(),
})

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/schedule-templates/[id] - Get template detail
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const template = await prisma.scheduleTemplate.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
    })

    if (!template) {
      return NextResponse.json({ error: 'Šablona nenalezena' }, { status: 404 })
    }

    return NextResponse.json(template)
  } catch (error) {
    console.error('Error fetching schedule template:', error)
    return NextResponse.json(
      { error: 'Chyba při načítání šablony' },
      { status: 500 }
    )
  }
}

// PUT /api/schedule-templates/[id] - Update template
export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const data = templateUpdateSchema.parse(body)

    // Verify template belongs to tenant
    const existing = await prisma.scheduleTemplate.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Šablona nenalezena' }, { status: 404 })
    }

    const template = await prisma.scheduleTemplate.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.slots && { slots: data.slots }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    })

    return NextResponse.json(template)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Neplatná data', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error updating schedule template:', error)
    return NextResponse.json(
      { error: 'Chyba při aktualizaci šablony' },
      { status: 500 }
    )
  }
}

// DELETE /api/schedule-templates/[id] - Delete template
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Verify template belongs to tenant
    const existing = await prisma.scheduleTemplate.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Šablona nenalezena' }, { status: 404 })
    }

    await prisma.scheduleTemplate.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting schedule template:', error)
    return NextResponse.json(
      { error: 'Chyba při mazání šablony' },
      { status: 500 }
    )
  }
}
