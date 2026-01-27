/**
 * API Route: /api/ai/calibrate-difficulty
 * AI endpoint for calibrating activity difficulty based on team composition
 */

import { NextRequest, NextResponse } from 'next/server'
import { createDifficultyCalibratorAI, DifficultyCalibratorInput } from '@/lib/ai/difficulty-calibrator'
import { createAIClient } from '@vertigo/ai-core/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { activityId, activityTitle, defaultDifficulty, teamComposition, targetDuration } = body

    if (!activityId || !activityTitle || !teamComposition) {
      return NextResponse.json(
        { success: false, error: 'Activity ID, title, and team composition are required' },
        { status: 400 }
      )
    }

    const aiClient = createAIClient({
      apiKey: process.env.OPENAI_API_KEY || '',
    })
    const calibrator = createDifficultyCalibratorAI(aiClient)

    const input: DifficultyCalibratorInput = {
      activityId,
      activityTitle,
      defaultDifficulty: defaultDifficulty || 'medium',
      teamProfile: {
        size: teamComposition.size || 10,
        physicalLevel: teamComposition.physicalLevel,
        averageAge: teamComposition.averageAge,
        ageRange: teamComposition.ageRange,
        fitnessLevel: teamComposition.fitnessLevel,
        cognitiveLevel: teamComposition.cognitiveLevel,
        previousExperience: teamComposition.previousExperience,
        specialNeeds: teamComposition.specialNeeds,
      },
      targetDuration,
    }

    const result = await calibrator.calibrate(input)

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error('Error calibrating difficulty:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to calibrate difficulty',
      },
      { status: 500 }
    )
  }
}
