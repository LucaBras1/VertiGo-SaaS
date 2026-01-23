/**
 * API Route: /api/ai/analyze-team
 * TeamDynamicsAI - Analyze team and recommend activities
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAIServices } from '@/lib/ai-client'
import { prisma } from '@/lib/db'
import { teamDynamicsInputSchema } from '@/lib/ai/team-dynamics'

/**
 * POST /api/ai/analyze-team
 * Analyze team composition and get activity recommendations
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validationResult = teamDynamicsInputSchema.safeParse(body.teamProfile)
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

    const teamProfile = validationResult.data

    // Fetch available activities
    const activities = await prisma.activity.findMany({
      where: { status: 'active' },
      select: {
        id: true,
        title: true,
        objectives: true,
        minParticipants: true,
        maxParticipants: true,
        physicalDemand: true,
        indoorOutdoor: true,
        duration: true,
        learningOutcomes: true,
        excerpt: true,
      },
    })

    // Format activities for AI
    const formattedActivities = activities.map((activity) => ({
      id: activity.id,
      title: activity.title,
      objectives: (activity.objectives as string[]) || [],
      minParticipants: activity.minParticipants || undefined,
      maxParticipants: activity.maxParticipants || undefined,
      physicalDemand: activity.physicalDemand || undefined,
      indoorOutdoor: activity.indoorOutdoor || undefined,
      duration: activity.duration,
      learningOutcomes: (activity.learningOutcomes as string[]) || undefined,
      description: activity.excerpt || undefined,
    }))

    // Get AI services
    const ai = getAIServices()

    // Record start time for latency tracking
    const startTime = Date.now()

    // Analyze team
    const analysis = await ai.teamDynamics.analyze(teamProfile, formattedActivities)

    // Record latency
    const latencyMs = Date.now() - startTime

    // Track AI usage (optional - for analytics)
    await prisma.aIUsage.create({
      data: {
        feature: 'team_dynamics',
        model: 'gpt-4o-mini',
        promptTokens: 0, // Would need to extract from AI response
        completionTokens: 0,
        totalTokens: 0,
        latencyMs,
        estimatedCost: 0, // Calculate based on token usage
      },
    })

    return NextResponse.json({
      success: true,
      data: analysis,
      meta: {
        latencyMs,
        activitiesAnalyzed: formattedActivities.length,
      },
    })
  } catch (error) {
    console.error('Error analyzing team:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to analyze team',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
