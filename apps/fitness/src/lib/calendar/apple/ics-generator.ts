/**
 * Apple Calendar ICS Feed Generator
 *
 * Generates ICS (iCalendar) format for Apple Calendar and other calendar apps.
 */

interface ICSEvent {
  uid: string
  summary: string
  description?: string
  location?: string
  start: Date
  end: Date
  organizer?: {
    name: string
    email: string
  }
  attendees?: Array<{
    name: string
    email: string
  }>
  url?: string
  categories?: string[]
  status?: 'TENTATIVE' | 'CONFIRMED' | 'CANCELLED'
  created?: Date
  lastModified?: Date
}

interface ICSCalendar {
  name: string
  description?: string
  timezone: string
  events: ICSEvent[]
}

/**
 * Format date to ICS format (YYYYMMDDTHHMMSS)
 */
function formatICSDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return `${year}${month}${day}T${hours}${minutes}${seconds}`
}

/**
 * Format date to UTC ICS format
 */
function formatICSDateUTC(date: Date): string {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  const hours = String(date.getUTCHours()).padStart(2, '0')
  const minutes = String(date.getUTCMinutes()).padStart(2, '0')
  const seconds = String(date.getUTCSeconds()).padStart(2, '0')

  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`
}

/**
 * Escape special characters for ICS
 */
function escapeICS(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}

/**
 * Fold long lines according to ICS spec (max 75 chars)
 */
function foldLine(line: string): string {
  const maxLength = 75
  if (line.length <= maxLength) return line

  let result = ''
  let remaining = line

  while (remaining.length > maxLength) {
    // For first line, use full length. For subsequent lines, account for leading space
    const cutLength = result === '' ? maxLength : maxLength - 1
    result += remaining.substring(0, cutLength) + '\r\n '
    remaining = remaining.substring(cutLength)
  }

  return result + remaining
}

/**
 * Generate VEVENT component
 */
function generateVEVENT(event: ICSEvent, timezone: string): string {
  const lines: string[] = []

  lines.push('BEGIN:VEVENT')
  lines.push(`UID:${event.uid}`)
  lines.push(`DTSTAMP:${formatICSDateUTC(new Date())}`)
  lines.push(`DTSTART;TZID=${timezone}:${formatICSDate(event.start)}`)
  lines.push(`DTEND;TZID=${timezone}:${formatICSDate(event.end)}`)
  lines.push(`SUMMARY:${escapeICS(event.summary)}`)

  if (event.description) {
    lines.push(`DESCRIPTION:${escapeICS(event.description)}`)
  }

  if (event.location) {
    lines.push(`LOCATION:${escapeICS(event.location)}`)
  }

  if (event.organizer) {
    lines.push(`ORGANIZER;CN=${escapeICS(event.organizer.name)}:mailto:${event.organizer.email}`)
  }

  if (event.attendees) {
    for (const attendee of event.attendees) {
      lines.push(`ATTENDEE;CN=${escapeICS(attendee.name)}:mailto:${attendee.email}`)
    }
  }

  if (event.url) {
    lines.push(`URL:${event.url}`)
  }

  if (event.categories && event.categories.length > 0) {
    lines.push(`CATEGORIES:${event.categories.map(escapeICS).join(',')}`)
  }

  if (event.status) {
    lines.push(`STATUS:${event.status}`)
  }

  if (event.created) {
    lines.push(`CREATED:${formatICSDateUTC(event.created)}`)
  }

  if (event.lastModified) {
    lines.push(`LAST-MODIFIED:${formatICSDateUTC(event.lastModified)}`)
  }

  // Add reminder (30 minutes before)
  lines.push('BEGIN:VALARM')
  lines.push('ACTION:DISPLAY')
  lines.push('DESCRIPTION:Reminder')
  lines.push('TRIGGER:-PT30M')
  lines.push('END:VALARM')

  lines.push('END:VEVENT')

  return lines.map(foldLine).join('\r\n')
}

/**
 * Generate VTIMEZONE component for Europe/Prague
 */
function generateVTIMEZONE(): string {
  return `BEGIN:VTIMEZONE
TZID:Europe/Prague
X-LIC-LOCATION:Europe/Prague
BEGIN:DAYLIGHT
TZOFFSETFROM:+0100
TZOFFSETTO:+0200
TZNAME:CEST
DTSTART:19700329T020000
RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU
END:DAYLIGHT
BEGIN:STANDARD
TZOFFSETFROM:+0200
TZOFFSETTO:+0100
TZNAME:CET
DTSTART:19701025T030000
RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU
END:STANDARD
END:VTIMEZONE`
}

/**
 * Generate complete ICS calendar
 */
export function generateICS(calendar: ICSCalendar): string {
  const lines: string[] = []

  // Calendar header
  lines.push('BEGIN:VCALENDAR')
  lines.push('VERSION:2.0')
  lines.push('PRODID:-//FitAdmin//FitAdmin Calendar//CS')
  lines.push('CALSCALE:GREGORIAN')
  lines.push('METHOD:PUBLISH')
  lines.push(`X-WR-CALNAME:${escapeICS(calendar.name)}`)

  if (calendar.description) {
    lines.push(`X-WR-CALDESC:${escapeICS(calendar.description)}`)
  }

  lines.push(`X-WR-TIMEZONE:${calendar.timezone}`)

  // Add timezone definition
  lines.push(generateVTIMEZONE())

  // Add events
  for (const event of calendar.events) {
    lines.push(generateVEVENT(event, calendar.timezone))
  }

  // Calendar footer
  lines.push('END:VCALENDAR')

  return lines.join('\r\n')
}

/**
 * Generate event hash for change detection
 */
export function generateEventHash(event: {
  summary: string
  start: Date
  end: Date
  location?: string
  description?: string
}): string {
  const data = [
    event.summary,
    event.start.toISOString(),
    event.end.toISOString(),
    event.location || '',
    event.description || '',
  ].join('|')

  // Simple hash function
  let hash = 0
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }

  return Math.abs(hash).toString(36)
}
