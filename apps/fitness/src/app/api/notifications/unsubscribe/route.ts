import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { unregisterSubscription } from '@/lib/notifications/push-service'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { endpoint } = body

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint is required' },
        { status: 400 }
      )
    }

    const success = await unregisterSubscription(endpoint)

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to unsubscribe' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('POST /api/notifications/unsubscribe error:', error)
    return NextResponse.json(
      { error: 'Failed to unsubscribe', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
