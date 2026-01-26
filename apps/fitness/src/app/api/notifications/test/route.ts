import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sendNotification, isWebPushConfigured } from '@/lib/notifications/push-service'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!isWebPushConfigured()) {
      return NextResponse.json(
        { error: 'Push notifications not configured' },
        { status: 503 }
      )
    }

    const result = await sendNotification(
      'user',
      session.user.id,
      {
        title: 'Test notifikace',
        body: 'Pokud vidíte tuto zprávu, push notifikace fungují správně!',
        data: {
          url: '/dashboard',
          type: 'test',
        },
        tag: 'test-notification',
      },
      session.user.tenantId,
      'general'
    )

    return NextResponse.json({
      success: true,
      push: result.push,
      email: result.email,
      message: result.push
        ? 'Push notifikace odeslána'
        : 'Žádná aktivní subscription nenalezena',
    })
  } catch (error) {
    console.error('POST /api/notifications/test error:', error)
    return NextResponse.json(
      { error: 'Failed to send test notification' },
      { status: 500 }
    )
  }
}
