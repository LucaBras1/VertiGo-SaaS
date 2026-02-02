import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getInquiries, getWidgetStats } from '@/lib/services/booking-widget'
import { BookingInquiryStatus } from '@/generated/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as BookingInquiryStatus | null
    const stats = searchParams.get('stats') === 'true'

    if (stats) {
      const widgetStats = await getWidgetStats(session.user.tenantId)
      return NextResponse.json({ success: true, data: widgetStats })
    }

    const result = await getInquiries(session.user.tenantId, {
      status: status || undefined,
    })

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('GET /api/inquiries error:', error)
    return NextResponse.json({ error: 'Failed to fetch inquiries' }, { status: 500 })
  }
}
