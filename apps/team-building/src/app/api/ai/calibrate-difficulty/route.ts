/**
 * API Route: /api/ai/calibrate-difficulty
 * AI endpoint for calibrating activity difficulty based on team composition
 */

import { NextRequest, NextResponse } from 'next/server'
import { calibrateDifficulty } from '@/lib/ai/difficulty-calibrator'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { activityId, teamComposition } = body

    if (!activityId || !teamComposition) {
      return NextResponse.json(
        { success: false, error: 'Activity ID and team composition are required' },
        { status: 400 }
      )
    }

    const result = await calibrateDifficulty(activityId, teamComposition)

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
