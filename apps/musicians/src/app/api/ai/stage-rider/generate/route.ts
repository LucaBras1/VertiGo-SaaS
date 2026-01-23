import { NextRequest, NextResponse } from 'next/server'
import { generateStageRider, StageRiderInputSchema } from '@/lib/ai/stage-rider-generator'
import { z } from 'zod'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const input = StageRiderInputSchema.parse(body)

    // TODO: Get tenantId and contact info from session
    const context = {
      tenantId: 'mock-tenant-id',
      contactInfo: {
        name: 'John Doe',
        phone: '+420 123 456 789',
        email: 'contact@band.com',
      },
    }

    // Generate stage rider
    const rider = await generateStageRider(input, context)

    return NextResponse.json({
      success: true,
      data: rider,
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

    console.error('Stage rider generation error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate stage rider',
      },
      { status: 500 }
    )
  }
}
