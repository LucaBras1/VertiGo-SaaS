import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getTemplates, createTemplate } from '@/lib/services/contracts'
import { ContractLanguage } from '@/generated/prisma'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const createTemplateSchema = z.object({
  name: z.string().min(1),
  language: z.enum(['CS', 'EN']).optional(),
  description: z.string().optional(),
  sections: z.array(z.object({
    id: z.string(),
    title: z.string(),
    content: z.string(),
    order: z.number(),
  })),
  defaultClauses: z.array(z.string()).optional(),
  isDefault: z.boolean().optional(),
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const templates = await getTemplates(session.user.tenantId)
    return NextResponse.json({ success: true, data: templates })
  } catch (error) {
    console.error('GET /api/contracts/templates error:', error)
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validated = createTemplateSchema.parse(body)

    const template = await createTemplate({
      tenantId: session.user.tenantId,
      ...validated,
      language: (validated.language || 'CS') as ContractLanguage,
    })

    return NextResponse.json({ success: true, data: template }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error('POST /api/contracts/templates error:', error)
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 })
  }
}
