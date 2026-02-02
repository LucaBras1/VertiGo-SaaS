import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  getReminderSettings,
  updateReminderSettings,
  getUpcomingReminders,
  type ReminderSettingsUpdate,
} from '@/lib/services/reminders'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const updateSchema = z.object({
  enabled: z.boolean().optional(),
  gigReminders: z.object({
    enabled: z.boolean().optional(),
    daysBefore: z.array(z.number().min(0).max(30)).optional(),
    sendToClient: z.boolean().optional(),
    sendToSelf: z.boolean().optional(),
  }).optional(),
  invoiceReminders: z.object({
    enabled: z.boolean().optional(),
    daysBeforeDue: z.number().min(1).max(14).optional(),
    daysAfterDue: z.array(z.number().min(1).max(30)).optional(),
  }).optional(),
  quoteReminders: z.object({
    enabled: z.boolean().optional(),
    daysAfterSent: z.array(z.number().min(1).max(30)).optional(),
  }).optional(),
  timezone: z.string().optional(),
})

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const upcoming = searchParams.get('upcoming') === 'true'

    if (upcoming) {
      const reminders = await getUpcomingReminders(session.user.tenantId)
      return NextResponse.json({ success: true, data: reminders })
    }

    const settings = await getReminderSettings(session.user.tenantId)
    return NextResponse.json({ success: true, data: settings })
  } catch (error) {
    console.error('GET /api/tenant/reminders error:', error)
    return NextResponse.json({ error: 'Failed to fetch reminder settings' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validated = updateSchema.parse(body) as ReminderSettingsUpdate

    const settings = await updateReminderSettings(session.user.tenantId, validated)
    return NextResponse.json({ success: true, data: settings })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error('PATCH /api/tenant/reminders error:', error)
    return NextResponse.json({ error: 'Failed to update reminder settings' }, { status: 500 })
  }
}
