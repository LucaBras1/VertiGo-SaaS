import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { dismissReminder, snoozeReminder } from '@/lib/services/reminders'

export const dynamic = 'force-dynamic'

// Dismiss reminder
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const reminder = await dismissReminder(id, session.user.tenantId)

    return NextResponse.json({ success: true, data: reminder })
  } catch (error) {
    if (error instanceof Error && error.message === 'Reminder not found') {
      return NextResponse.json({ error: 'Reminder not found' }, { status: 404 })
    }
    console.error('DELETE /api/reminders/[id] error:', error)
    return NextResponse.json({ error: 'Failed to dismiss reminder' }, { status: 500 })
  }
}
