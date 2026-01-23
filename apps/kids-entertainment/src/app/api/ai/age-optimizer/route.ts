/**
 * Age Optimizer AI API Route
 * POST /api/ai/age-optimizer
 */

import { NextRequest, NextResponse } from 'next/server'
import { optimizeForAge } from '@/lib/ai'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    if (!body.ageGroup || !body.currentProgram) {
      return NextResponse.json(
        { error: 'Missing required fields: ageGroup, currentProgram' },
        { status: 400 }
      )
    }

    // Call AI
    const result = await optimizeForAge({
      ageGroup: body.ageGroup,
      currentProgram: body.currentProgram,
      guestCount: body.guestCount || 10,
      duration: body.duration || 180,
      venueType: body.venueType || 'home',
    })

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error('Age Optimizer AI error:', error)
    return NextResponse.json(
      {
        error: 'Failed to optimize program for age group',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
