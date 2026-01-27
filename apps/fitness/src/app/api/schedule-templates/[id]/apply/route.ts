import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { addDays, startOfWeek, setHours, setMinutes } from 'date-fns'

const applySchema = z.object({
  startDate: z.string(), // ISO date string
  clientId: z.string().optional(), // For sessions
  weeks: z.number().min(1).max(12).optional().default(1),
})

interface RouteParams {
  params: Promise<{ id: string }>
}

interface ScheduleSlot {
  dayOfWeek: number
  startTime: string
  duration: number
  type: 'session' | 'class' | 'break'
  title?: string
  notes?: string
}

// POST /api/schedule-templates/[id]/apply - Apply template to create sessions/classes
export async function POST(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const data = applySchema.parse(body)

    // Get the template
    const template = await prisma.scheduleTemplate.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
    })

    if (!template) {
      return NextResponse.json({ error: 'Šablona nenalezena' }, { status: 404 })
    }

    // Verify client if provided
    if (data.clientId) {
      const client = await prisma.client.findFirst({
        where: {
          id: data.clientId,
          tenantId: session.user.tenantId,
        },
      })

      if (!client) {
        return NextResponse.json({ error: 'Klient nenalezen' }, { status: 404 })
      }
    }

    const slots = template.slots as unknown as ScheduleSlot[]
    const startDate = new Date(data.startDate)
    const weekStart = startOfWeek(startDate, { weekStartsOn: 1 }) // Monday

    const createdSessions: { id: string; scheduledAt: Date; type: string }[] = []
    const createdClasses: { id: string; scheduledAt: Date; name: string }[] = []
    const errors: { slot: ScheduleSlot; error: string }[] = []

    // Process each week
    for (let week = 0; week < data.weeks; week++) {
      // Process each slot
      for (const slot of slots) {
        if (slot.type === 'break') continue // Skip break slots

        // Calculate the date for this slot
        const slotDate = addDays(weekStart, week * 7 + slot.dayOfWeek)
        const [hours, minutes] = slot.startTime.split(':').map(Number)
        const scheduledAt = setMinutes(setHours(slotDate, hours), minutes)

        // Skip if date is in the past
        if (scheduledAt < new Date()) {
          continue
        }

        try {
          if (slot.type === 'session' && data.clientId) {
            // Create session
            const newSession = await prisma.session.create({
              data: {
                tenantId: session.user.tenantId,
                clientId: data.clientId,
                scheduledAt,
                duration: slot.duration,
                status: 'scheduled',
                trainerNotes: slot.notes,
              },
            })
            createdSessions.push({
              id: newSession.id,
              scheduledAt: newSession.scheduledAt,
              type: 'session',
            })
          } else if (slot.type === 'class') {
            // Create class
            const newClass = await prisma.class.create({
              data: {
                tenantId: session.user.tenantId,
                name: slot.title || 'Skupinová lekce',
                scheduledAt,
                duration: slot.duration,
                status: 'scheduled',
                type: 'group',
                capacity: 10,
                price: 0,
              },
            })
            createdClasses.push({
              id: newClass.id,
              scheduledAt: newClass.scheduledAt,
              name: newClass.name,
            })
          }
        } catch (error) {
          errors.push({
            slot,
            error: error instanceof Error ? error.message : 'Neznámá chyba',
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Vytvořeno ${createdSessions.length} tréninků a ${createdClasses.length} lekcí`,
      sessions: createdSessions,
      classes: createdClasses,
      errors: errors.length > 0 ? errors : undefined,
      weeks: data.weeks,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Neplatná data', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error applying schedule template:', error)
    return NextResponse.json(
      { error: 'Chyba při aplikování šablony' },
      { status: 500 }
    )
  }
}
