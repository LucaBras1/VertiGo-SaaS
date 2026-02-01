import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendSessionReminder, sendClassReminder } from '@/lib/notifications/push-service'

// Default reminder window in minutes
const DEFAULT_REMINDER_MINUTES = 60

/**
 * Verify the cron secret for security
 */
function verifyCronSecret(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    console.warn('[SessionRemindersCron] CRON_SECRET not configured')
    return false
  }

  const authHeader = request.headers.get('authorization')
  if (!authHeader) {
    return false
  }

  const token = authHeader.replace('Bearer ', '')
  return token === cronSecret
}

/**
 * GET /api/cron/session-reminders
 * Cron job for sending session reminders
 *
 * Finds sessions and classes starting within the reminder window
 * and sends push/email notifications to clients and trainers.
 */
export async function GET(request: NextRequest) {
  // Verify cron secret
  if (!verifyCronSecret(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const startTime = Date.now()
  const stats = {
    sessionsChecked: 0,
    sessionReminders: 0,
    classesChecked: 0,
    classReminders: 0,
    errors: [] as string[],
  }

  try {
    const now = new Date()

    // Get all unique reminder windows from notification preferences
    // Default to 60 minutes if no preferences set
    const preferences = await prisma.notificationPreference.findMany({
      where: {
        sessionReminders: true,
      },
      select: {
        tenantId: true,
        reminderMinutesBefore: true,
      },
      distinct: ['tenantId'],
    })

    // Create a map of tenant -> reminder minutes
    const tenantReminderWindows = new Map<string, number>()
    for (const pref of preferences) {
      tenantReminderWindows.set(pref.tenantId, pref.reminderMinutesBefore)
    }

    // Calculate the time window - use max of all windows to catch everything
    const maxReminderMinutes = preferences.length > 0
      ? Math.max(...preferences.map(p => p.reminderMinutesBefore))
      : DEFAULT_REMINDER_MINUTES

    const windowStart = now
    const windowEnd = new Date(now.getTime() + maxReminderMinutes * 60 * 1000)

    // Find sessions that need reminders
    // Sessions scheduled between now and the reminder window that haven't been reminded
    const sessions = await prisma.session.findMany({
      where: {
        status: 'scheduled',
        scheduledAt: {
          gte: windowStart,
          lte: windowEnd,
        },
      },
      include: {
        client: true,
        tenant: true,
      },
    })

    stats.sessionsChecked = sessions.length

    // Check if reminder was already sent (using NotificationLog)
    for (const session of sessions) {
      try {
        // Get tenant-specific reminder window
        const reminderMinutes = tenantReminderWindows.get(session.tenantId) || DEFAULT_REMINDER_MINUTES
        const reminderTime = new Date(session.scheduledAt.getTime() - reminderMinutes * 60 * 1000)

        // Only send if we're within 5 minutes of the reminder time
        if (now < reminderTime || now > new Date(reminderTime.getTime() + 5 * 60 * 1000)) {
          continue
        }

        // Check if we already sent a reminder for this session
        const existingReminder = await prisma.notificationLog.findFirst({
          where: {
            tenantId: session.tenantId,
            type: 'session_reminder',
            data: {
              path: ['entityId'],
              equals: session.id,
            },
            sentAt: {
              gte: new Date(now.getTime() - 60 * 60 * 1000), // Within last hour
            },
          },
        })

        if (existingReminder) {
          continue
        }

        // Send the reminder
        await sendSessionReminder(session.id, session.tenantId)
        stats.sessionReminders++
      } catch (error: any) {
        console.error(`[SessionRemindersCron] Failed to send session reminder for ${session.id}:`, error)
        stats.errors.push(`Session ${session.id}: ${error.message}`)
      }
    }

    // Find classes that need reminders
    const classes = await prisma.class.findMany({
      where: {
        status: 'scheduled',
        scheduledAt: {
          gte: windowStart,
          lte: windowEnd,
        },
      },
      include: {
        bookings: {
          where: {
            status: 'confirmed',
          },
        },
        tenant: true,
      },
    })

    stats.classesChecked = classes.length

    for (const fitnessClass of classes) {
      try {
        // Get tenant-specific reminder window
        const reminderMinutes = tenantReminderWindows.get(fitnessClass.tenantId) || DEFAULT_REMINDER_MINUTES
        const reminderTime = new Date(fitnessClass.scheduledAt.getTime() - reminderMinutes * 60 * 1000)

        // Only send if we're within 5 minutes of the reminder time
        if (now < reminderTime || now > new Date(reminderTime.getTime() + 5 * 60 * 1000)) {
          continue
        }

        // Check if we already sent a reminder for this class
        const existingReminder = await prisma.notificationLog.findFirst({
          where: {
            tenantId: fitnessClass.tenantId,
            type: 'class_reminder',
            data: {
              path: ['entityId'],
              equals: fitnessClass.id,
            },
            sentAt: {
              gte: new Date(now.getTime() - 60 * 60 * 1000), // Within last hour
            },
          },
        })

        if (existingReminder) {
          continue
        }

        // Only send if there are confirmed bookings
        if (fitnessClass.bookings.length > 0) {
          await sendClassReminder(fitnessClass.id, fitnessClass.tenantId)
          stats.classReminders++
        }
      } catch (error: any) {
        console.error(`[SessionRemindersCron] Failed to send class reminder for ${fitnessClass.id}:`, error)
        stats.errors.push(`Class ${fitnessClass.id}: ${error.message}`)
      }
    }

    const duration = Date.now() - startTime

    return NextResponse.json({
      success: true,
      stats: {
        ...stats,
        durationMs: duration,
        timestamp: now.toISOString(),
      },
    })
  } catch (error: any) {
    console.error('[SessionRemindersCron] Cron job failed:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stats,
      },
      { status: 500 }
    )
  }
}
