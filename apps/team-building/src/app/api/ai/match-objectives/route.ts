/**
 * API Route: /api/ai/match-objectives
 * ObjectiveMatcherAI - Match team objectives to activities
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAIServices } from '@/lib/ai-client'
import { prisma } from '@/lib/db'
import { objectiveMatcherInputSchema } from '@/lib/ai/objective-matcher'

/**
 * POST /api/ai/match-objectives
 * Match team objectives to appropriate activities
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validationResult = objectiveMatcherInputSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid input',
          details: validationResult.error.errors,
        },
        { status: 400 }
      )
    }

    const input = validationResult.data

    // Fetch available activities
    const activities = await prisma.activity.findMany({
      where: { status: 'active' },
      select: {
        id: true,
        title: true,
        objectives: true,
        learningOutcomes: true,
        excerpt: true,
        facilitatorGuide: true,
      },
    })

    // Format activities for AI
    const formattedActivities = activities.map((activity) => ({
      id: activity.id,
      title: activity.title,
      objectives: (activity.objectives as string[]) || [],
      learningOutcomes: (activity.learningOutcomes as string[]) || undefined,
      description: activity.excerpt || undefined,
      facilitatorGuide: activity.facilitatorGuide,
    }))

    // Get AI services
    const ai = getAIServices()

    // Record start time
    const startTime = Date.now()

    // Match objectives
    const matches = await ai.objectiveMatcher.match(input, formattedActivities)

    // Record latency
    const latencyMs = Date.now() - startTime

    // Track AI usage
    await prisma.aIUsage.create({
      data: {
        feature: 'objective_matcher',
        model: 'gpt-4o-mini',
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        latencyMs,
        estimatedCost: 0,
      },
    })

    return NextResponse.json({
      success: true,
      data: matches,
      meta: {
        latencyMs,
        objectivesAnalyzed: input.objectives.length,
        activitiesConsidered: formattedActivities.length,
      },
    })
  } catch (error) {
    console.error('Error matching objectives:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to match objectives',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
