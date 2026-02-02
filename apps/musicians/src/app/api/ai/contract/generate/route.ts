import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generateContract } from '@/lib/ai/contract-generator'
import { ContractLanguage } from '@/generated/prisma'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const generateSchema = z.object({
  language: z.enum(['CS', 'EN']).optional(),
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
  eventType: z.string().optional(),
  customInstructions: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validated = generateSchema.parse(body)

    const contract = await generateContract({
      ...validated,
      language: (validated.language || 'CS') as ContractLanguage,
    })

    return NextResponse.json({ success: true, data: contract })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error('POST /api/ai/contract/generate error:', error)
    return NextResponse.json({ error: 'Failed to generate contract' }, { status: 500 })
  }
}
