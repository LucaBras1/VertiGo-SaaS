import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { applyCreditNote } from '@/lib/invoices/credit-note-service'

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

    const result = await applyCreditNote(id, session.user.tenantId)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Apply credit note error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to apply credit note' },
      { status: 500 }
    )
  }
}
