import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// The NotificationLog.status field uses: pending, sent, failed, delivered
// We use 'delivered' to mark as "read" since it's the terminal positive state
const READ_STATUS = 'delivered'

/**
 * GET /api/notifications
 * Get notifications for the current user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)
    const unreadOnly = searchParams.get('unread') === 'true'

    const tenantId = session.user.tenantId
    const userId = session.user.id

    // Get notifications for the user
    // "Unread" means status is 'sent' (not yet marked as delivered/read)
    const notifications = await prisma.notificationLog.findMany({
      where: {
        tenantId,
        recipientType: 'user',
        recipientId: userId,
        status: { in: unreadOnly ? ['sent', 'pending'] : ['sent', 'pending', READ_STATUS] },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    })

    // Get unread count (sent but not delivered/read)
    const unreadCount = await prisma.notificationLog.count({
      where: {
        tenantId,
        recipientType: 'user',
        recipientId: userId,
        status: { in: ['sent', 'pending'] },
      },
    })

    return NextResponse.json({
      notifications: notifications.map(n => ({
        id: n.id,
        type: n.type,
        title: n.title,
        body: n.body,
        data: n.data,
        status: n.status === READ_STATUS ? 'read' : n.status, // Normalize for frontend
        sentAt: n.sentAt,
        createdAt: n.createdAt,
      })),
      unreadCount,
      hasMore: notifications.length === limit,
    })
  } catch (error: any) {
    console.error('[Notifications] Failed to get notifications:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get notifications' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/notifications
 * Mark notifications as read
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { ids, markAll } = body

    const tenantId = session.user.tenantId
    const userId = session.user.id

    if (markAll) {
      // Mark all notifications as read (delivered)
      await prisma.notificationLog.updateMany({
        where: {
          tenantId,
          recipientType: 'user',
          recipientId: userId,
          status: { in: ['sent', 'pending'] },
        },
        data: { status: READ_STATUS },
      })
    } else if (ids && Array.isArray(ids)) {
      // Mark specific notifications as read (delivered)
      await prisma.notificationLog.updateMany({
        where: {
          id: { in: ids },
          tenantId,
          recipientType: 'user',
          recipientId: userId,
        },
        data: { status: READ_STATUS },
      })
    } else {
      return NextResponse.json(
        { error: 'Either ids array or markAll flag is required' },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[Notifications] Failed to update notifications:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update notifications' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/notifications
 * Delete notifications
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { ids, deleteAll } = body

    const tenantId = session.user.tenantId
    const userId = session.user.id

    if (deleteAll) {
      // Delete all notifications older than 30 days
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      await prisma.notificationLog.deleteMany({
        where: {
          tenantId,
          recipientType: 'user',
          recipientId: userId,
          createdAt: { lt: thirtyDaysAgo },
        },
      })
    } else if (ids && Array.isArray(ids)) {
      // Delete specific notifications
      await prisma.notificationLog.deleteMany({
        where: {
          id: { in: ids },
          tenantId,
          recipientType: 'user',
          recipientId: userId,
        },
      })
    } else {
      return NextResponse.json(
        { error: 'Either ids array or deleteAll flag is required' },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[Notifications] Failed to delete notifications:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete notifications' },
      { status: 500 }
    )
  }
}
