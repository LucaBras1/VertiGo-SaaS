import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { calculateGigPrice, GigPriceInputSchema } from '@/lib/ai/gig-price-calculator'
import { z } from 'zod'


// Force dynamic to avoid build-time issues
export const dynamic = 'force-dynamic'
export async function POST(request: NextRequest) {
  try {
    // Get session and validate
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Validate input
    const input = GigPriceInputSchema.parse(body)

    // Calculate pricing with real tenantId
    const context = { tenantId: session.user.tenantId }

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
