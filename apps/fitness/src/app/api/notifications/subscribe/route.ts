import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { registerSubscription, getVapidPublicKey } from '@/lib/notifications/push-service'

export async function GET() {
  // Return VAPID public key for client-side subscription
  const vapidPublicKey = getVapidPublicKey()

  if (!vapidPublicKey) {
    return NextResponse.json(
      { error: 'Push notifications not configured' },
      { status: 503 }
    )
  }

  return NextResponse.json({ vapidPublicKey })
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { subscription, deviceName } = body

    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return NextResponse.json(
        { error: 'Invalid subscription data' },
        { status: 400 }
      )
    }

    const userAgent = request.headers.get('user-agent') || undefined

    const success = await registerSubscription(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
      },
      session.user.tenantId,
      'user',
      session.user.id,
      userAgent,
      deviceName
    )

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to register subscription' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('POST /api/notifications/subscribe error:', error)
    return NextResponse.json(
      { error: 'Failed to subscribe', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
