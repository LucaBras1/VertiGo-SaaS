import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generateStageRider, StageRiderInputSchema } from '@/lib/ai/stage-rider-generator'
import { z } from 'zod'


// Force dynamic to avoid build-time issues
export const dynamic = 'force-dynamic'
// Dynamic import to avoid build-time issues
async function getPrisma() {
  const { prisma } = await import('@/lib/db')
  return prisma
}

export async function POST(request: NextRequest) {
  try {
    // Get session and validate
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Validate input
    const input = StageRiderInputSchema.parse(body)

    // Fetch tenant for contact info
    const prisma = await getPrisma()
    const tenant = await prisma.tenant.findUnique({
      where: { id: session.user.tenantId },
      select: {
        name: true,
        email: true,
        phone: true,
        bandName: true,
      },
    })

    // Build context with real data
    const context = {
      tenantId: session.user.tenantId,
      contactInfo: {
        name: tenant?.bandName || tenant?.name || session.user.name || '',
        phone: tenant?.phone || '',
        email: tenant?.email || session.user.email || '',
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
