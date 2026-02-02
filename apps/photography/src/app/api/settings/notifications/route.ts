import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

// Force dynamic to avoid build-time Prisma proxy issues
export const dynamic = 'force-dynamic'

const NotificationSettingsSchema = z.object({
  upcomingShoots: z.boolean(),
  newInquiries: z.boolean(),
  galleryReady: z.boolean(),
  paymentReminders: z.boolean(),
})

// Default notification settings (stored in memory/localStorage on client since User model doesn't have settings field)
const defaultNotifications = {
  upcomingShoots: true,
  newInquiries: true,
  galleryReady: true,
  paymentReminders: true,
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Return default settings - actual persistence would need schema extension
    return NextResponse.json(defaultNotifications)
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

    // Note: To actually persist these settings, the User model would need a settings JSON field
    // For now, just validate and return the submitted data
    return NextResponse.json(data)
  } catch (error) {
    console.error('PUT /api/settings/notifications error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: 'Failed to update notification settings' }, { status: 500 })
  }
}
