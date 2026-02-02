import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generateSetlist, SetlistGeneratorInputSchema } from '@/lib/ai/setlist-generator'
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
    const input = SetlistGeneratorInputSchema.parse(body)

    // Generate setlist with real tenantId
    const setlist = await generateSetlist(input, { tenantId: session.user.tenantId })

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
