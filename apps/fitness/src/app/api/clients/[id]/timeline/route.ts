import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { aggregateClientTimeline, TimelineEventType } from '@/lib/timeline/event-aggregator'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: clientId } = await params
    const { searchParams } = new URL(request.url)

    // Parse query parameters
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const types = searchParams.get('types')?.split(',') as TimelineEventType[] | undefined
    const milestonesOnly = searchParams.get('milestonesOnly') === 'true'

    const { events, total } = await aggregateClientTimeline({
      clientId,
      tenantId: session.user.tenantId,
      limit,
      offset,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      types,
      milestonesOnly,
    })

    return NextResponse.json({
      events,
      total,
      limit,
      offset,
      hasMore: offset + events.length < total,
    })
  } catch (error) {
    console.error('Timeline fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch timeline' },
      { status: 500 }
    )
  }
}
