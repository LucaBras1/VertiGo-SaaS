import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const exerciseSchema = z.object({
  name: z.string(),
  sets: z.number().optional(),
  reps: z.string().optional(),
  weight: z.string().optional(),
  duration: z.number().optional(),
  restSeconds: z.number().optional(),
  notes: z.string().optional(),
  muscleGroups: z.array(z.string()).optional(),
})

const templateUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  category: z.enum(['strength', 'cardio', 'hiit', 'flexibility', 'mixed']).optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  duration: z.number().min(15).max(180).optional(),
  exercises: z.array(exerciseSchema).optional(),
  muscleGroups: z.array(z.string()).optional(),
  equipment: z.array(z.string()).optional(),
  isPublic: z.boolean().optional(),
})

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/workout-templates/[id] - Get template detail
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const template = await prisma.workoutTemplate.findFirst({
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
    console.error('Error fetching template:', error)
    return NextResponse.json(
      { error: 'Chyba při načítání šablony' },
      { status: 500 }
    )
  }
}

// PUT /api/workout-templates/[id] - Update template
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
    const existing = await prisma.workoutTemplate.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Šablona nenalezena' }, { status: 404 })
    }

    const template = await prisma.workoutTemplate.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.category && { category: data.category }),
        ...(data.difficulty && { difficulty: data.difficulty }),
        ...(data.duration && { duration: data.duration }),
        ...(data.exercises && { exercises: data.exercises }),
        ...(data.muscleGroups && { muscleGroups: data.muscleGroups }),
        ...(data.equipment && { equipment: data.equipment }),
        ...(data.isPublic !== undefined && { isPublic: data.isPublic }),
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
    console.error('Error updating template:', error)
    return NextResponse.json(
      { error: 'Chyba při aktualizaci šablony' },
      { status: 500 }
    )
  }
}

// DELETE /api/workout-templates/[id] - Delete template
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Verify template belongs to tenant
    const existing = await prisma.workoutTemplate.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Šablona nenalezena' }, { status: 404 })
    }

    await prisma.workoutTemplate.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting template:', error)
    return NextResponse.json(
      { error: 'Chyba při mazání šablony' },
      { status: 500 }
    )
  }
}
