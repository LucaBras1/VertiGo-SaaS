import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { analyzeGuestExperience, ExperienceInputSchema, type ExperienceInput } from '@/lib/ai/guest-experience-analyzer'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()

    // Validate input
    const validationResult = ExperienceInputSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const input: ExperienceInput = validationResult.data

    // Analyze guest experience using AI algorithm
    const experienceAnalysis = await analyzeGuestExperience(input, {
      tenantId: session.user.tenantId,
    })

    return NextResponse.json({ experienceAnalysis })
  } catch (error) {
    console.error('Error analyzing guest experience:', error)
    return NextResponse.json(
      { error: 'Error analyzing guest experience' },
      { status: 500 }
    )
  }
}
