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

const templateCreateSchema = z.object({
  name: z.string().min(1, 'Název je povinný'),
  description: z.string().optional(),
  category: z.enum(['strength', 'cardio', 'hiit', 'flexibility', 'mixed']),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  duration: z.number().min(15).max(180),
  exercises: z.array(exerciseSchema),
  muscleGroups: z.array(z.string()),
  equipment: z.array(z.string()),
  isPublic: z.boolean().optional().default(false),
})

// GET /api/workout-templates - List templates
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const difficulty = searchParams.get('difficulty')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where = {
      tenantId: session.user.tenantId,
      ...(category && { category }),
      ...(difficulty && { difficulty }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    }

    const [templates, total] = await Promise.all([
      prisma.workoutTemplate.findMany({
        where,
        orderBy: [{ usageCount: 'desc' }, { name: 'asc' }],
        skip,
        take: limit,
      }),
      prisma.workoutTemplate.count({ where }),
    ])

    return NextResponse.json({
      templates,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json(
      { error: 'Chyba při načítání šablon' },
      { status: 500 }
    )
  }
}

// POST /api/workout-templates - Create template
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const data = templateCreateSchema.parse(body)

    const template = await prisma.workoutTemplate.create({
      data: {
        tenantId: session.user.tenantId,
        name: data.name,
        description: data.description,
        category: data.category,
        difficulty: data.difficulty,
        duration: data.duration,
        exercises: data.exercises,
        muscleGroups: data.muscleGroups,
        equipment: data.equipment,
        isPublic: data.isPublic,
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
    console.error('Error creating template:', error)
    return NextResponse.json(
      { error: 'Chyba při vytváření šablony' },
      { status: 500 }
    )
  }
}
