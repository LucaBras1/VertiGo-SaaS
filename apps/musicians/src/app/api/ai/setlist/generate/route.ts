import { NextRequest, NextResponse } from 'next/server'
import { generateSetlist, SetlistGeneratorInputSchema } from '@/lib/ai/setlist-generator'
import { z } from 'zod'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const input = SetlistGeneratorInputSchema.parse(body)

    // TODO: Get tenantId from session
    const tenantId = 'mock-tenant-id'

    // Generate setlist
    const setlist = await generateSetlist(input, { tenantId })

    return NextResponse.json({
      success: true,
      data: setlist,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid input',
          details: error.errors,
        },
        { status: 400 }
      )
    }

    console.error('Setlist generation error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate setlist',
      },
      { status: 500 }
    )
  }
}
