/**
 * API Route: /api/ai/generate-debrief
 * DebriefGeneratorAI - Generate HR-ready post-session reports
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAIServices } from '@/lib/ai-client'
import { prisma } from '@/lib/db'
import { sendDebriefEmail } from '@/lib/email'
import { format } from 'date-fns'

/**
 * POST /api/ai/generate-debrief
 * Generate comprehensive debrief report for a session
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, format: reportFormat = 'hr-standard', sendEmail, contactEmail, contactName } = body

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
        objectives: (session.objectives as string[]) || [],
        customObjectives: session.customObjectives || '',
      },
      program: {
        title: session.program?.title || 'Unknown Program',
        objectives: (session.program?.objectives as string[]) || [],
      },
      activitiesCompleted: session.program?.activityLinks.map((link) => ({
        title: link.activity.title,
        objectives: (link.activity.objectives as string[]) || [],
        duration: link.activity.duration,
      })) || [],
      format: reportFormat as 'executive' | 'detailed' | 'hr-standard',
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

    // Send debrief email if requested
    if (sendEmail && contactEmail) {
      const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3009'
      const viewUrl = `${appUrl}/admin/sessions/${session.id}`

      // Extract key data from report for email (handle different report structures)
      const reportData = report.report as Record<string, unknown>

      // Extract executive summary
      const executiveSummary = typeof reportData.executiveSummary === 'string'
        ? reportData.executiveSummary
        : 'Session completed successfully.'

      // Extract key insights (could be array of strings or objects)
      let keyInsights: string[] = ['Session objectives were met.']
      if (Array.isArray(reportData.keyInsights)) {
        keyInsights = reportData.keyInsights.map((item: unknown) =>
          typeof item === 'string' ? item : JSON.stringify(item)
        )
      }

      // Extract recommendations (could be array of strings or nested object)
      let recommendations: string[] = ['Continue team development activities.']
      if (Array.isArray(reportData.recommendations)) {
        recommendations = reportData.recommendations.map((item: unknown) =>
          typeof item === 'string' ? item : JSON.stringify(item)
        )
      } else if (reportData.recommendations && typeof reportData.recommendations === 'object') {
        // Handle nested recommendations structure
        const recs = reportData.recommendations as Record<string, unknown[]>
        recommendations = Object.values(recs)
          .flat()
          .slice(0, 3)
          .map((item: unknown) =>
            typeof item === 'object' && item !== null && 'action' in item
              ? String((item as { action: string }).action)
              : String(item)
          )
      }

      await sendDebriefEmail({
        to: contactEmail,
        contactName: contactName || 'Team',
        companyName: session.companyName || 'Your Company',
        programTitle: session.program?.title || 'Team Building Session',
        sessionDate: format(session.date, 'MMMM d, yyyy'),
        debrief: {
          executiveSummary,
          keyInsights,
          recommendations,
        },
        viewUrl,
      }).catch((err) => {
        console.error('Failed to send debrief email:', err)
        // Don't fail the request if email fails
      })
    }

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
