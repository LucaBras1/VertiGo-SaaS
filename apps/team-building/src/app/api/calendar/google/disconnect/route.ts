/**
 * Google Calendar Disconnect
 * POST /api/calendar/google/disconnect - Disconnect Google Calendar
 */

export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete integration (cascade deletes event syncs)
    await prisma.calendarIntegration.delete({
      where: {
        userId_provider: {
          userId: session.user.id,
          provider: 'google',
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    // Not found is OK - already disconnected
    if (error.code === 'P2025') {
      return NextResponse.json({ success: true })
    }

    console.error('Error disconnecting calendar:', error)
    return NextResponse.json({ error: 'Failed to disconnect' }, { status: 500 })
  }
}
