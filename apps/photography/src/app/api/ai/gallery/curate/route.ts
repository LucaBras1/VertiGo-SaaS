import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createGalleryCuratorAI, GalleryCurationInputSchema } from '@/lib/ai/gallery-curator'

// Force dynamic to avoid build-time Prisma proxy issues
export const dynamic = 'force-dynamic'

/**
 * POST /api/ai/gallery/curate
 *
 * AI-powered photo curation using GPT-4 Vision
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Validate input
    const input = GalleryCurationInputSchema.parse(body)

    const tenantId = session.user.tenantId

    // Create curator and analyze
    const curator = createGalleryCuratorAI()
    const curation = await curator.curate(input, { tenantId })

    return NextResponse.json({
      success: true,
      data: curation,
    })
  } catch (error) {
    console.error('Gallery curation error:', error)

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
        error: 'Failed to curate gallery',
      },
      { status: 500 }
    )
  }
}
