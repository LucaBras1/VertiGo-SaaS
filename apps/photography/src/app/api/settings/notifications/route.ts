import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const NotificationSettingsSchema = z.object({
  upcomingShoots: z.boolean(),
  newInquiries: z.boolean(),
  galleryReady: z.boolean(),
  paymentReminders: z.boolean(),
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { settings: true }
    })

    const settings = (user?.settings as Record<string, unknown>) || {}
    const notifications = (settings.notifications as Record<string, boolean>) || {
      upcomingShoots: true,
      newInquiries: true,
      galleryReady: true,
      paymentReminders: true,
    }

    return NextResponse.json(notifications)
  } catch (error) {
    console.error('GET /api/settings/notifications error:', error)
    return NextResponse.json({ error: 'Failed to fetch notification settings' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = NotificationSettingsSchema.parse(body)

    // Get current user settings
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { settings: true }
    })

    const currentSettings = (currentUser?.settings as Record<string, unknown>) || {}

    // Update user settings
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        settings: {
          ...currentSettings,
          notifications: data,
        },
        updatedAt: new Date(),
      }
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error('PUT /api/settings/notifications error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: 'Failed to update notification settings' }, { status: 500 })
  }
}
