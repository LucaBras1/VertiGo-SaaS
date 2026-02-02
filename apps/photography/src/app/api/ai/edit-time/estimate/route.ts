import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createEditTimePredictorAI, EditTimeInputSchema } from '@/lib/ai/edit-time-predictor'

// Force dynamic to avoid build-time Prisma proxy issues
export const dynamic = 'force-dynamic'

/**
 * POST /api/ai/edit-time/estimate
 *
 * Estimate editing time for a photography project
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Validate input
    const input = EditTimeInputSchema.parse(body)

    const tenantId = session.user.tenantId

    // Create predictor and estimate
    const predictor = createEditTimePredictorAI()
    const estimate = await predictor.estimateEditingTime(input, { tenantId })

    return NextResponse.json({
      success: true,
      data: estimate,
    })
  } catch (error) {
    console.error('Edit time estimation error:', error)

    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to estimate editing time',
      },
      { status: 500 }
    )
  }
}
