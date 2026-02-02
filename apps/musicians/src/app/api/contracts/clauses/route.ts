import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getClauses, createClause } from '@/lib/services/contracts'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const createClauseSchema = z.object({
  title: z.string().min(1),
  category: z.string().min(1),
  contentCs: z.string().min(1),
  contentEn: z.string().min(1),
  variables: z.array(z.string()).optional(),
  isRequired: z.boolean().optional(),
  isDefault: z.boolean().optional(),
})

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || undefined

    const clauses = await getClauses(session.user.tenantId, {
      category,
      includeSystem: true,
    })

    return NextResponse.json({ success: true, data: clauses })
  } catch (error) {
    console.error('GET /api/contracts/clauses error:', error)
    return NextResponse.json({ error: 'Failed to fetch clauses' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validated = createClauseSchema.parse(body)

    const clause = await createClause({
      tenantId: session.user.tenantId,
      ...validated,
    })

    return NextResponse.json({ success: true, data: clause }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error('POST /api/contracts/clauses error:', error)
    return NextResponse.json({ error: 'Failed to create clause' }, { status: 500 })
  }
}
