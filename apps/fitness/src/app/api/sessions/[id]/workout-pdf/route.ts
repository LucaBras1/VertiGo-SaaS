import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { renderToBuffer } from '@react-pdf/renderer'
import { WorkoutPlanPDF, WorkoutPlanData } from '@/lib/pdf/workout-plan-pdf'
import { WorkoutPlan } from '@/lib/ai/workout-generator'
import React from 'react'

// Default workout plan for sessions without AI-generated plans
const defaultWorkoutPlan: WorkoutPlan = {
  warmup: [
    { exercise: 'Light cardio', duration: '5 minutes', notes: 'Get heart rate up gradually' },
    { exercise: 'Dynamic stretching', duration: '5 minutes', notes: 'Focus on major muscle groups' },
  ],
  mainWorkout: [
    {
      exercise: 'Squats',
      sets: 3,
      reps: '10-12',
      restSeconds: 60,
      muscleGroups: ['legs', 'glutes'],
      alternatives: ['Lunges', 'Leg press'],
      formTips: 'Keep chest up, knees over toes',
    },
    {
      exercise: 'Push-ups',
      sets: 3,
      reps: '10-15',
      restSeconds: 60,
      muscleGroups: ['chest', 'arms', 'shoulders'],
      alternatives: ['Bench press', 'Incline push-ups'],
      formTips: 'Keep core tight, full range of motion',
    },
    {
      exercise: 'Rows',
      sets: 3,
      reps: '10-12',
      restSeconds: 60,
      muscleGroups: ['back', 'arms'],
      alternatives: ['Lat pulldown', 'Inverted rows'],
      formTips: 'Squeeze shoulder blades at top',
    },
    {
      exercise: 'Plank',
      sets: 3,
      reps: '30 seconds',
      restSeconds: 30,
      muscleGroups: ['core'],
      alternatives: ['Dead bug', 'Bird dog'],
      formTips: 'Keep body in straight line',
    },
  ],
  cooldown: [
    { exercise: 'Static stretching', duration: '5 minutes', notes: 'Hold each stretch 30 seconds' },
    { exercise: 'Deep breathing', duration: '2 minutes', notes: 'Relax and recover' },
  ],
  summary: {
    totalDuration: 45,
    estimatedCalories: 300,
    difficulty: 5,
    muscleGroupsCovered: ['legs', 'glutes', 'chest', 'arms', 'back', 'core'],
  },
  notes: {
    focusPoints: ['Maintain proper form', 'Control the movement', 'Breathe consistently'],
    safetyReminders: ['Stop if you feel sharp pain', 'Stay hydrated'],
    motivationalTip: 'Every workout counts!',
    nextSessionSuggestion: 'Focus on different muscle groups next time',
  },
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Fetch session with client details
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
            fitnessLevel: true,
          },
        },
      },
    })

    if (!trainingSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Fetch tenant details
    const tenant = await prisma.tenant.findUnique({
      where: { id: session.user.tenantId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
    })

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    // Get workout plan from session or use default
    let workoutPlan: WorkoutPlan

    if (trainingSession.workoutPlan && typeof trainingSession.workoutPlan === 'object') {
      workoutPlan = trainingSession.workoutPlan as unknown as WorkoutPlan
    } else {
      workoutPlan = defaultWorkoutPlan
    }

    // Determine session type from muscle groups
    const muscleGroups = trainingSession.muscleGroups || workoutPlan.summary.muscleGroupsCovered
    let sessionType = 'mixed'

    if (muscleGroups.includes('full_body')) {
      sessionType = 'mixed'
    } else if (muscleGroups.every(m => ['chest', 'back', 'shoulders', 'arms'].includes(m))) {
      sessionType = 'strength'
    } else if (muscleGroups.every(m => ['legs', 'glutes'].includes(m))) {
      sessionType = 'strength'
    }

    // Build PDF data
    const pdfData: WorkoutPlanData = {
      warmup: workoutPlan.warmup,
      mainWorkout: workoutPlan.mainWorkout,
      cooldown: workoutPlan.cooldown,
      summary: {
        totalDuration: trainingSession.duration || workoutPlan.summary.totalDuration,
        estimatedCalories: trainingSession.caloriesBurned || workoutPlan.summary.estimatedCalories,
        difficulty: workoutPlan.summary.difficulty,
        muscleGroupsCovered: muscleGroups.length > 0 ? muscleGroups : workoutPlan.summary.muscleGroupsCovered,
      },
      notes: workoutPlan.notes,
      client: {
        name: trainingSession.client.name,
        fitnessLevel: trainingSession.client.fitnessLevel || undefined,
      },
      session: {
        date: trainingSession.scheduledAt.toISOString(),
        type: sessionType,
        duration: trainingSession.duration,
      },
      tenant: {
        name: tenant.name,
        email: tenant.email || undefined,
        phone: tenant.phone || undefined,
      },
    }

    // Generate PDF buffer
    const pdfBuffer = await renderToBuffer(
      React.createElement(WorkoutPlanPDF, { data: pdfData }) as React.ReactElement
    )

    // Create filename
    const clientSlug = trainingSession.client.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    const dateStr = trainingSession.scheduledAt.toISOString().split('T')[0]
    const filename = `workout-plan-${clientSlug}-${dateStr}.pdf`

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error) {
    console.error('GET /api/sessions/[id]/workout-pdf error:', error)
    return NextResponse.json(
      { error: 'Failed to generate workout PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
