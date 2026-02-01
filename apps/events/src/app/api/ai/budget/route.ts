import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { optimizeBudget, BudgetInputSchema, type BudgetInput } from '@/lib/ai/budget-optimizer'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()

    // Validate input
    const validationResult = BudgetInputSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const input: BudgetInput = validationResult.data

    // Generate budget allocation using AI algorithm
    const budgetAllocation = await optimizeBudget(input, {
      tenantId: session.user.tenantId,
    })

    return NextResponse.json({ budgetAllocation })
  } catch (error) {
    console.error('Error generating budget allocation:', error)
    return NextResponse.json(
      { error: 'Error generating budget allocation' },
      { status: 500 }
    )
  }
}
