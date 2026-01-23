/**
 * Theme Suggester AI API Route
 * POST /api/ai/theme-suggester
 */

import { NextRequest, NextResponse } from 'next/server'
import { suggestThemes } from '@/lib/ai'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    if (!body.childAge || !body.childInterests) {
      return NextResponse.json(
        { error: 'Missing required fields: childAge, childInterests' },
        { status: 400 }
      )
    }

    // Call AI
    const result = await suggestThemes({
      childAge: body.childAge,
      childInterests: Array.isArray(body.childInterests)
        ? body.childInterests
        : [body.childInterests],
      childGender: body.childGender,
      budgetLevel: body.budgetLevel || 'standard',
      venueType: body.venueType || 'home',
      season: body.season || 'spring',
      guestCount: body.guestCount || 15,
    })

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error('Theme Suggester AI error:', error)
    return NextResponse.json(
      {
        error: 'Failed to suggest themes',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
