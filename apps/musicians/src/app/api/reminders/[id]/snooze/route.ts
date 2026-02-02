import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { snoozeReminder } from '@/lib/services/reminders'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const snoozeSchema = z.object({
  days: z.number().min(1).max(30),
})

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { days } = snoozeSchema.parse(body)

    const reminder = await snoozeReminder(id, session.user.tenantId, days)

    return NextResponse.json({ success: true, data: reminder })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    if (error instanceof Error && error.message === 'Reminder not found') {
      return NextResponse.json({ error: 'Reminder not found' }, { status: 404 })
    }
    console.error('POST /api/reminders/[id]/snooze error:', error)
    return NextResponse.json({ error: 'Failed to snooze reminder' }, { status: 500 })
  }
}
