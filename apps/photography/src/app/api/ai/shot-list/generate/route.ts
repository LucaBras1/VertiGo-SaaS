import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generateShotList, ShotListInputSchema } from '@/lib/ai/shot-list-generator'

// Force dynamic to avoid build-time Prisma proxy issues
export const dynamic = 'force-dynamic'

/**
 * POST /api/ai/shot-list/generate
 *
 * Generate AI-powered shot list based on event details
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Validate input
    const input = ShotListInputSchema.parse(body)

    const tenantId = session.user.tenantId

    // Generate shot list
    const shotList = await generateShotList(input, { tenantId })

    return NextResponse.json({
      success: true,
      data: shotList,
    })
  } catch (error) {
    console.error('Shot list generation error:', error)

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
        error: 'Failed to generate shot list',
      },
      { status: 500 }
    )
  }
}
