import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generateWorkout, WorkoutGeneratorInputSchema } from '@/lib/ai/workout-generator'
import { z } from 'zod'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()

    // Validate input
    const input = WorkoutGeneratorInputSchema.parse(body)

    // Generate workout
    const result = await generateWorkout(input, { tenantId: session.user.tenantId })

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid input',
          details: error.errors,
        },
        { status: 400 }
      )
    }

    console.error('[AI/Workout] Generation error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate workout plan',
      },
      { status: 500 }
    )
  }
}
