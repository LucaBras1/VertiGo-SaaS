import { NextRequest, NextResponse } from 'next/server'
import { calculateGigPrice, GigPriceInputSchema } from '@/lib/ai/gig-price-calculator'
import { z } from 'zod'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const input = GigPriceInputSchema.parse(body)

    // TODO: Get tenantId from session
    const context = { tenantId: 'mock-tenant-id' }

    // Calculate pricing
    const pricing = await calculateGigPrice(input, context)

    return NextResponse.json({
      success: true,
      data: pricing,
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

    console.error('Pricing calculation error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to calculate pricing',
      },
      { status: 500 }
    )
  }
}
