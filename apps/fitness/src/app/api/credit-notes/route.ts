import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getCreditNotes } from '@/lib/invoices/credit-note-service'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const invoiceId = searchParams.get('invoiceId') || undefined
    const status = searchParams.get('status') || undefined
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const { creditNotes, total } = await getCreditNotes(session.user.tenantId, {
      invoiceId,
      status,
      limit,
      offset,
    })

    return NextResponse.json({
      creditNotes,
      total,
      limit,
      offset,
      hasMore: offset + creditNotes.length < total,
    })
  } catch (error) {
    console.error('Credit notes fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch credit notes' },
      { status: 500 }
    )
  }
}
