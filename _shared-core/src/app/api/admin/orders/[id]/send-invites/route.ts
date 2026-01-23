// API Route: /api/admin/orders/[id]/send-invites
// Send calendar invites and emails to participants

import { NextRequest, NextResponse } from 'next/server'
import { sendParticipantInvites } from '@/lib/participants'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/admin/orders/[id]/send-invites
 * Send calendar invites and emails to participants
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { participantIds, sendCalendar = true, sendEmail = true } = body

    const result = await sendParticipantInvites({
      orderId: id,
      participantIds,
      sendCalendar,
      sendEmail,
    })

    if (!result.success && result.errors.length > 0 && result.participantCount === 0) {
      return NextResponse.json(
        { success: false, error: result.errors[0] || 'Zadni ucastnici k odeslani' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: result.success,
      results: {
        calendarEvents: result.calendarEvents,
        emailsSent: result.emailsSent,
        errors: result.errors,
      },
      calendarConfigured: result.calendarConfigured,
    })
  } catch (error) {
    console.error('Error sending invites:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send invites',
      },
      { status: 500 }
    )
  }
}
