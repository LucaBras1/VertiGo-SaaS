/**
 * ICS Feed Generator
 * Generates ICS (iCalendar) feeds for Apple Calendar, Outlook, etc.
 */

import { prisma } from '@/lib/db'
import { sessionToCalendarEvent } from '../sync-service'
import crypto from 'crypto'

/**
 * Generate a unique feed token for a user
 */
export async function generateFeedToken(userId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex')

  await prisma.calendarFeedToken.create({
    data: {
      userId,
      token,
      expiresAt: null, // No expiry for feed tokens
    },
  })

  return token
}

/**
 * Revoke a feed token
 */
export async function revokeFeedToken(token: string): Promise<boolean> {
  try {
    await prisma.calendarFeedToken.delete({
      where: { token },
    })
    return true
  } catch {
    return false
  }
}

/**
 * Validate a feed token and return user ID
 */
export async function validateFeedToken(token: string): Promise<string | null> {
  const feedToken = await prisma.calendarFeedToken.findUnique({
    where: { token },
  })

  if (!feedToken) return null
  if (feedToken.expiresAt && feedToken.expiresAt < new Date()) return null

  return feedToken.userId
}

/**
 * Generate ICS content for all sessions
 */
export async function generateICSFeed(userId: string): Promise<string> {
  // Get all confirmed/completed sessions
  const sessions = await prisma.session.findMany({
    where: {
      status: { in: ['confirmed', 'completed', 'tentative'] },
    },
    include: {
      program: {
        select: { title: true, duration: true },
      },
    },
    orderBy: { date: 'asc' },
  })

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//TeamForge//Team Building Calendar//CS',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:TeamForge Sessions',
    'X-WR-TIMEZONE:Europe/Prague',
  ]

  // Add timezone definition
  lines.push(
    'BEGIN:VTIMEZONE',
    'TZID:Europe/Prague',
    'BEGIN:STANDARD',
    'DTSTART:19701025T030000',
    'RRULE:FREQ=YEARLY;BYDAY=-1SU;BYMONTH=10',
    'TZOFFSETFROM:+0200',
    'TZOFFSETTO:+0100',
    'TZNAME:CET',
    'END:STANDARD',
    'BEGIN:DAYLIGHT',
    'DTSTART:19700329T020000',
    'RRULE:FREQ=YEARLY;BYDAY=-1SU;BYMONTH=3',
    'TZOFFSETFROM:+0100',
    'TZOFFSETTO:+0200',
    'TZNAME:CEST',
    'END:DAYLIGHT',
    'END:VTIMEZONE'
  )

  for (const session of sessions) {
    const event = sessionToCalendarEvent({
      id: session.id,
      date: session.date,
      endDate: session.endDate,
      companyName: session.companyName,
      teamName: session.teamName,
      teamSize: session.teamSize,
      venue: (session.venue as { name?: string; address?: string; city?: string }) || {},
      program: session.program,
      objectives: session.objectives as string[] | null,
      notes: session.notes,
    })

    const uid = `${session.id}@teamforge.ai`
    const dtstamp = formatICSDate(new Date())
    const dtstart = formatICSDate(event.start)
    const dtend = formatICSDate(event.end)

    lines.push(
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART;TZID=Europe/Prague:${dtstart}`,
      `DTEND;TZID=Europe/Prague:${dtend}`,
      `SUMMARY:${escapeICSText(event.summary)}`,
      `DESCRIPTION:${escapeICSText(event.description)}`,
      event.location ? `LOCATION:${escapeICSText(event.location)}` : '',
      `STATUS:${session.status === 'tentative' ? 'TENTATIVE' : 'CONFIRMED'}`,
      'END:VEVENT'
    )
  }

  lines.push('END:VCALENDAR')

  return lines.filter(Boolean).join('\r\n')
}

/**
 * Format date for ICS format
 */
function formatICSDate(date: Date): string {
  return date
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '')
    .replace('Z', '')
}

/**
 * Escape special characters for ICS text
 */
function escapeICSText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}

/**
 * Get feed URL for a token
 */
export function getFeedUrl(token: string): string {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3009'
  return `${baseUrl}/api/calendar/feed/${token}`
}
