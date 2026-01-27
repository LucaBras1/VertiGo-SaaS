import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const slotSchema = z.object({
  dayOfWeek: z.number().min(0).max(6), // 0 = Sunday, 1 = Monday, etc.
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Formát musí být HH:mm'),
  duration: z.number().min(15).max(180),
  type: z.enum(['session', 'class', 'break']),
  title: z.string().optional(),
  notes: z.string().optional(),
})

const templateCreateSchema = z.object({
  name: z.string().min(1, 'Název je povinný'),
  description: z.string().optional(),
  slots: z.array(slotSchema),
  isActive: z.boolean().optional().default(true),
})

// GET /api/schedule-templates - List templates
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const activeOnly = searchParams.get('activeOnly') === 'true'

    const templates = await prisma.scheduleTemplate.findMany({
      where: {
        tenantId: session.user.tenantId,
        ...(activeOnly && { isActive: true }),
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ templates })
  } catch (error) {
    console.error('Error fetching schedule templates:', error)
    return NextResponse.json(
      { error: 'Chyba při načítání šablon rozvrhu' },
      { status: 500 }
    )
  }
}

// POST /api/schedule-templates - Create template
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const data = templateCreateSchema.parse(body)

    const template = await prisma.scheduleTemplate.create({
      data: {
        tenantId: session.user.tenantId,
        name: data.name,
        description: data.description,
        slots: data.slots,
        isActive: data.isActive,
      },
    })

    return NextResponse.json(template, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Neplatná data', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error creating schedule template:', error)
    return NextResponse.json(
      { error: 'Chyba při vytváření šablony rozvrhu' },
      { status: 500 }
    )
  }
}
