import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  createContract,
  listContracts,
  type CreateContractInput,
} from '@/lib/services/contracts'
import type { ContractStatus } from '@/generated/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const packageId = searchParams.get('packageId') || undefined
    const clientId = searchParams.get('clientId') || undefined
    const status = searchParams.get('status') as ContractStatus | undefined
    const search = searchParams.get('search') || undefined

    const contracts = await listContracts(session.user.tenantId, {
      packageId,
      clientId,
      status,
      search,
    })

    return NextResponse.json({ data: contracts })
  } catch (error) {
    console.error('GET /api/contracts error:', error)
    return NextResponse.json({ error: 'Failed to fetch contracts' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { packageId, clientId, templateId, title, content, clauses, expiresAt } = body

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    const input: CreateContractInput = {
      tenantId: session.user.tenantId,
      packageId,
      clientId,
      templateId,
      title,
      content,
      clauses,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    }

    const contract = await createContract(input)

    return NextResponse.json(contract, { status: 201 })
  } catch (error) {
    console.error('POST /api/contracts error:', error)
    return NextResponse.json({ error: 'Failed to create contract' }, { status: 500 })
  }
}
