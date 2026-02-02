import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  getContract,
  updateContract,
  deleteContract,
  sendContract,
  cancelContract,
} from '@/lib/services/contracts'
import { sendContractEmail } from '@/lib/email'
import type { ContractStatus } from '@/generated/prisma'

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
    const contract = await getContract(id, session.user.tenantId)

    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 })
    }

    return NextResponse.json(contract)
  } catch (error) {
    console.error('GET /api/contracts/[id] error:', error)
    return NextResponse.json({ error: 'Failed to fetch contract' }, { status: 500 })
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
    const { title, content, clauses, status, expiresAt } = body

    const contract = await updateContract(id, session.user.tenantId, {
      title,
      content,
      clauses,
      status: status as ContractStatus,
      expiresAt: expiresAt === null ? null : expiresAt ? new Date(expiresAt) : undefined,
    })

    return NextResponse.json(contract)
  } catch (error) {
    console.error('PUT /api/contracts/[id] error:', error)
    return NextResponse.json({ error: 'Failed to update contract' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    await deleteContract(id, session.user.tenantId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/contracts/[id] error:', error)
    return NextResponse.json({ error: 'Failed to delete contract' }, { status: 500 })
  }
}

// POST /api/contracts/[id] - Special actions (send, cancel)
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { searchParams } = new URL(req.url)
    const action = searchParams.get('action')

    if (action === 'send') {
      const contract = await sendContract(id, session.user.tenantId)

      // Get client email for sending
      if (contract.client?.email) {
        const signUrl = `${process.env.NEXTAUTH_URL}/sign/${contract.signToken}`

        await sendContractEmail({
          to: contract.client.email,
          clientName: contract.client.name,
          contractTitle: contract.title,
          signUrl,
          packageTitle: contract.package?.title,
          expiresAt: contract.expiresAt?.toLocaleDateString('cs-CZ'),
          photographerName: session.user.name || 'Your Photographer',
        })
      }

      return NextResponse.json(contract)
    }

    if (action === 'cancel') {
      const contract = await cancelContract(id, session.user.tenantId)
      return NextResponse.json(contract)
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('POST /api/contracts/[id] action error:', error)
    const message = error instanceof Error ? error.message : 'Failed to perform action'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
