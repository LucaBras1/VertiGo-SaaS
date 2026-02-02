/**
 * Google Calendar Settings
 * PATCH /api/calendar/google/settings - Update calendar settings
 */

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { calendarId, syncEnabled } = body

    const integration = await prisma.calendarIntegration.update({
      where: {
        userId_provider: {
          userId: session.user.id,
          provider: 'google',
        },
      },
      data: {
        ...(calendarId !== undefined && { calendarId }),
        ...(syncEnabled !== undefined && { syncEnabled }),
      },
    })

    return NextResponse.json({
      calendarId: integration.calendarId,
      syncEnabled: integration.syncEnabled,
    })
  } catch (error) {
    console.error('Error updating calendar settings:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
