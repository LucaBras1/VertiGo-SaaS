import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { duplicateContract } from '@/lib/services/contracts'

export const dynamic = 'force-dynamic'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const contract = await duplicateContract(id, session.user.tenantId)

    return NextResponse.json({ success: true, data: contract }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'Contract not found') {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 })
    }
    console.error('POST /api/contracts/[id]/duplicate error:', error)
    return NextResponse.json({ error: 'Failed to duplicate contract' }, { status: 500 })
  }
}
