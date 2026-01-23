/**
 * Safety Checker AI API Route
 * POST /api/ai/safety-checker
 */

import { NextRequest, NextResponse } from 'next/server'
import { checkSafety } from '@/lib/ai'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    if (!body.activities || !Array.isArray(body.activities)) {
      return NextResponse.json(
        { error: 'Missing or invalid required field: activities (must be array)' },
        { status: 400 }
      )
    }

    // Call AI
    const result = await checkSafety({
      activities: body.activities,
      allergies: body.allergies || [],
      ageMin: body.ageMin || 3,
      ageMax: body.ageMax || 12,
      guestCount: body.guestCount || 10,
      venueType: body.venueType || 'home',
      specialNeeds: body.specialNeeds,
    })

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error('Safety Checker AI error:', error)
    return NextResponse.json(
      {
        error: 'Failed to check safety',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
