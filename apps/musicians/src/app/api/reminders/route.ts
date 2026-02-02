import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSentReminders } from '@/lib/services/reminders'
import { ReminderType } from '@/generated/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const entityId = searchParams.get('entityId') || undefined
    const type = searchParams.get('type') as ReminderType | null
    const dismissed = searchParams.get('dismissed')

    const reminders = await getSentReminders(session.user.tenantId, {
      entityId,
      type: type || undefined,
      dismissed: dismissed === 'true' ? true : dismissed === 'false' ? false : undefined,
    })

    return NextResponse.json({ success: true, data: reminders })
  } catch (error) {
    console.error('GET /api/reminders error:', error)
    return NextResponse.json({ error: 'Failed to fetch reminders' }, { status: 500 })
  }
}
