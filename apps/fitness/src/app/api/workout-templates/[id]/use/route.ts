import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

// POST /api/workout-templates/[id]/use - Use template for a session
export async function POST(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Get the template
    const template = await prisma.workoutTemplate.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
    })

    if (!template) {
      return NextResponse.json({ error: 'Šablona nenalezena' }, { status: 404 })
    }

    // Increment usage count
    await prisma.workoutTemplate.update({
      where: { id },
      data: { usageCount: { increment: 1 } },
    })

    // Return workout plan in the format expected by sessions
    const workoutPlan = {
      templateId: template.id,
      templateName: template.name,
      category: template.category,
      difficulty: template.difficulty,
      duration: template.duration,
      warmup: [],
      mainWorkout: template.exercises,
      cooldown: [],
      summary: {
        totalDuration: template.duration,
        muscleGroupsCovered: template.muscleGroups,
        difficulty: template.difficulty,
      },
    }

    return NextResponse.json({
      success: true,
      workoutPlan,
      template: {
        id: template.id,
        name: template.name,
        category: template.category,
        duration: template.duration,
      },
    })
  } catch (error) {
    console.error('Error using template:', error)
    return NextResponse.json(
      { error: 'Chyba při použití šablony' },
      { status: 500 }
    )
  }
}
