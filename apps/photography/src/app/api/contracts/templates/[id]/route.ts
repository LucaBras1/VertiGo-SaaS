import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  getContractTemplate,
  updateContractTemplate,
  deleteContractTemplate,
} from '@/lib/services/contracts'

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const template = await getContractTemplate(id, session.user.tenantId)

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    return NextResponse.json(template)
  } catch (error) {
    console.error('GET /api/contracts/templates/[id] error:', error)
    return NextResponse.json({ error: 'Failed to fetch template' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const { name, eventType, content, clauses, isDefault } = body

    const template = await updateContractTemplate(id, session.user.tenantId, {
      name,
      eventType,
      content,
      clauses,
      isDefault,
    })

    return NextResponse.json(template)
  } catch (error) {
    console.error('PUT /api/contracts/templates/[id] error:', error)
    return NextResponse.json({ error: 'Failed to update template' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    await deleteContractTemplate(id, session.user.tenantId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/contracts/templates/[id] error:', error)
    return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 })
  }
}
