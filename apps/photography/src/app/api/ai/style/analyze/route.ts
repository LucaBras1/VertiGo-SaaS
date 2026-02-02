import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createStyleMatcherAI, StyleAnalysisInputSchema } from '@/lib/ai/style-matcher'

// Force dynamic to avoid build-time import issues
export const dynamic = 'force-dynamic'

/**
 * POST /api/ai/style/analyze
 *
 * Analyze photography style from portfolio images
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Validate input
    const input = StyleAnalysisInputSchema.parse(body)

    const tenantId = session.user.tenantId

    // Create style matcher and analyze
    const matcher = createStyleMatcherAI()
    const analysis = await matcher.analyzeStyle(input, { tenantId })

    return NextResponse.json({
      success: true,
      data: analysis,
    })
  } catch (error) {
    console.error('Style analysis error:', error)

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
        error: 'Failed to analyze style',
      },
      { status: 500 }
    )
  }
}
