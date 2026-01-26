import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generateNutritionAdvice, NutritionAdvisorInputSchema } from '@/lib/ai/nutrition-advisor'
import { z } from 'zod'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()

    // Validate input
    const input = NutritionAdvisorInputSchema.parse(body)

    // Generate nutrition advice
    const result = await generateNutritionAdvice(input, { tenantId: session.user.tenantId })

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    // Handle Zod validation errors
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

    console.error('[AI/Nutrition] Generation error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate nutrition advice',
      },
      { status: 500 }
    )
  }
}
