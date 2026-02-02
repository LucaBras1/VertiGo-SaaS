import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { convertInquiryToGig } from '@/lib/services/booking-widget'

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
    const gig = await convertInquiryToGig(id, session.user.tenantId)

    return NextResponse.json({ success: true, data: gig }, { status: 201 })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Inquiry not found') {
        return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })
      }
      if (error.message === 'Inquiry already converted to gig') {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
    }
    console.error('POST /api/inquiries/[id]/convert error:', error)
    return NextResponse.json({ error: 'Failed to convert inquiry' }, { status: 500 })
  }
}
