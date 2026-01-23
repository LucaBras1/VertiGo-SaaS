import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const sessionUpdateSchema = z.object({
  scheduledAt: z.string().optional(),
  duration: z.number().int().min(15).max(180).optional(),
  status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled', 'no_show']).optional(),
  muscleGroups: z.array(z.string()).optional(),
  workoutPlan: z.any().optional(),
  exercisesLogged: z.array(z.any()).optional(),
  caloriesBurned: z.number().optional(),
  heartRateAvg: z.number().optional(),
  clientFeedback: z.string().optional(),
  trainerNotes: z.string().optional(),
  intensity: z.enum(['low', 'moderate', 'high']).optional(),
  clientRating: z.number().int().min(1).max(5).optional(),
  price: z.number().optional(),
  paid: z.boolean().optional(),
})

// GET /api/sessions/[id]
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

    const trainingSession = await prisma.session.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            goals: true,
            fitnessLevel: true,
            currentWeight: true,
            injuryHistory: true,
          },
        },
      },
    })

    if (!trainingSession) {
      return NextResponse.json({ error: 'Session nenalezena' }, { status: 404 })
    }

    return NextResponse.json(trainingSession)
  } catch (error) {
    console.error('Error fetching session:', error)
    return NextResponse.json({ error: 'Chyba při načítání session' }, { status: 500 })
  }
}

// PATCH /api/sessions/[id]
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
    const data = sessionUpdateSchema.parse(body)

    const existingSession = await prisma.session.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
    })

    if (!existingSession) {
      return NextResponse.json({ error: 'Session nenalezena' }, { status: 404 })
    }

    const updatedSession = await prisma.session.update({
      where: { id },
      data: {
        ...data,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
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

    // If session is completed, deduct credit from client
    if (data.status === 'completed' && existingSession.status !== 'completed') {
      await prisma.client.update({
        where: { id: existingSession.clientId },
        data: {
          creditsRemaining: {
            decrement: 1,
          },
        },
      })
    }

    return NextResponse.json(updatedSession)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Neplatná data', details: error.errors }, { status: 400 })
    }
    console.error('Error updating session:', error)
    return NextResponse.json({ error: 'Chyba při aktualizaci session' }, { status: 500 })
  }
}

// DELETE /api/sessions/[id]
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

    const existingSession = await prisma.session.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
    })

    if (!existingSession) {
      return NextResponse.json({ error: 'Session nenalezena' }, { status: 404 })
    }

    await prisma.session.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting session:', error)
    return NextResponse.json({ error: 'Chyba při mazání session' }, { status: 500 })
  }
}
