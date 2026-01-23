/**
 * Photo Moment Predictor AI API Route
 * POST /api/ai/photo-moments
 */

import { NextRequest, NextResponse } from 'next/server'
import { predictPhotoMoments } from '@/lib/ai'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    if (!body.timeline || !body.activities) {
      return NextResponse.json(
        { error: 'Missing required fields: timeline, activities' },
        { status: 400 }
      )
    }

    // Call AI
    const result = await predictPhotoMoments({
      timeline: body.timeline,
      activities: body.activities,
      venueType: body.venueType || 'home',
      startTime: body.startTime || '14:00',
      specialMoments: body.specialMoments || [],
      childPersonality: body.childPersonality,
    })

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error('Photo Moment Predictor AI error:', error)
    return NextResponse.json(
      {
        error: 'Failed to predict photo moments',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
