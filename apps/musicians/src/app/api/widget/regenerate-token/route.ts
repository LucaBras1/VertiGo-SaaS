import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { regenerateWidgetToken } from '@/lib/services/booking-widget'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const widget = await regenerateWidgetToken(session.user.tenantId)
    return NextResponse.json({ success: true, data: widget })
  } catch (error) {
    console.error('POST /api/widget/regenerate-token error:', error)
    return NextResponse.json({ error: 'Failed to regenerate token' }, { status: 500 })
  }
}
