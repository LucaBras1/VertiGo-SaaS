import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getContracts, createContract } from '@/lib/services/contracts'
import { ContractStatus, ContractLanguage } from '@/generated/prisma'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const createContractSchema = z.object({
  templateId: z.string().optional(),
  gigId: z.string().optional(),
  language: z.enum(['CS', 'EN']).optional(),
  title: z.string().min(1),
  performerInfo: z.object({
    name: z.string(),
    address: z.string().optional(),
    ico: z.string().optional(),
    dic: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
  }),
  clientInfo: z.object({
    name: z.string(),
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
    company: z.string().optional(),
  }),
  eventDetails: z.object({
    title: z.string(),
    date: z.string(),
    time: z.string().optional(),
    venue: z.string().optional(),
    duration: z.number().optional(),
    description: z.string().optional(),
  }),
  financialTerms: z.object({
    totalPrice: z.number(),
    deposit: z.number().optional(),
    depositDue: z.string().optional(),
    paymentDue: z.string().optional(),
    currency: z.string(),
  }),
  sections: z.array(z.object({
    id: z.string(),
    title: z.string(),
    content: z.string(),
    order: z.number(),
  })),
  clauses: z.array(z.object({
    clauseId: z.string(),
    title: z.string(),
    content: z.string(),
    order: z.number(),
  })),
  aiGenerated: z.boolean().optional(),
  aiPrompt: z.string().optional(),
})

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as ContractStatus | null
    const gigId = searchParams.get('gigId') || undefined

    const result = await getContracts(session.user.tenantId, {
      status: status || undefined,
      gigId,
    })

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('GET /api/contracts error:', error)
    return NextResponse.json({ error: 'Failed to fetch contracts' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validated = createContractSchema.parse(body)

    const contract = await createContract({
      tenantId: session.user.tenantId,
      ...validated,
      language: (validated.language || 'CS') as ContractLanguage,
    })

    return NextResponse.json({ success: true, data: contract }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error('POST /api/contracts error:', error)
    return NextResponse.json({ error: 'Failed to create contract' }, { status: 500 })
  }
}
