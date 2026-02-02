import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  createContractTemplate,
  listContractTemplates,
} from '@/lib/services/contracts'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const eventType = searchParams.get('eventType') || undefined

    const templates = await listContractTemplates(session.user.tenantId, eventType)

    return NextResponse.json({ data: templates })
  } catch (error) {
    console.error('GET /api/contracts/templates error:', error)
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name, eventType, content, clauses, isDefault } = body

    if (!name || !content) {
      return NextResponse.json(
        { error: 'Name and content are required' },
        { status: 400 }
      )
    }

    const template = await createContractTemplate({
      tenantId: session.user.tenantId,
      name,
      eventType,
      content,
      clauses,
      isDefault,
    })

    return NextResponse.json(template, { status: 201 })
  } catch (error) {
    console.error('POST /api/contracts/templates error:', error)
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 })
  }
}
