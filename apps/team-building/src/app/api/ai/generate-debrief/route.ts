/**
 * API Route: /api/ai/generate-debrief
 * DebriefGeneratorAI - Generate HR-ready post-session reports
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAIServices } from '@/lib/ai-client'
import { prisma } from '@/lib/db'

/**
 * POST /api/ai/generate-debrief
 * Generate comprehensive debrief report for a session
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId } = body

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Fetch session with program and activities
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        program: {
          include: {
            activityLinks: {
              include: {
                activity: true,
              },
            },
          },
        },
      },
    })

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      )
    }

    // Get AI services
    const ai = getAIServices()

    // Record start time
    const startTime = Date.now()

    // Prepare input for debrief generator
    const input = {
      session: {
        id: session.id,
        date: session.date.toISOString(),
        teamSize: session.teamSize || 0,
        teamName: session.teamName || '',
        companyName: session.companyName || '',
        objectives: session.objectives || [],
        customObjectives: session.customObjectives || '',
      },
      program: {
        title: session.program?.title || 'Unknown Program',
        objectives: session.program?.objectives || [],
      },
      activitiesCompleted: session.program?.activityLinks.map((link) => ({
        title: link.activity.title,
        objectives: link.activity.objectives || [],
        duration: link.activity.duration,
      })) || [],
    }

    // Generate debrief
    const report = await ai.debriefGenerator.generate(input)

    // Record latency
    const latencyMs = Date.now() - startTime

    // Track AI usage (uses GPT-4o, more expensive)
    await prisma.aIUsage.create({
      data: {
        feature: 'debrief_generator',
        sessionId: session.id,
        model: 'gpt-4o',
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        latencyMs,
        estimatedCost: 0,
      },
    })

    // Update session with debrief
    await prisma.session.update({
      where: { id: session.id },
      data: {
        debriefCompleted: true,
        debriefReport: report.report as any,
        debriefGeneratedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      data: report,
      meta: {
        latencyMs,
        activitiesAnalyzed: input.activitiesCompleted.length,
      },
    })
  } catch (error) {
    console.error('Error generating debrief:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate debrief',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
