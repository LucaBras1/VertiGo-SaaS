/**
 * ICS (iCalendar) generator for Apple Calendar and other iCal clients
 */

interface IcsEvent {
  uid: string
  title: string
  description?: string
  location?: string
  startDate: Date
  endDate: Date
  created: Date
  lastModified: Date
  status?: 'TENTATIVE' | 'CONFIRMED' | 'CANCELLED'
  url?: string
  categories?: string[]
  organizer?: {
    name: string
    email: string
  }
}

/**
 * Escape special characters for ICS format
 */
function escapeIcsValue(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}

/**
 * Format date to ICS datetime format (UTC)
 */
function formatIcsDateTime(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

/**
 * Format date to ICS date format (date only)
 */
function formatIcsDate(date: Date): string {
  return date.toISOString().split('T')[0].replace(/-/g, '')
}

/**
 * Generate a single ICS event
 */
function generateIcsEvent(event: IcsEvent): string {
  const lines: string[] = [
    'BEGIN:VEVENT',
    `UID:${event.uid}`,
    `DTSTAMP:${formatIcsDateTime(new Date())}`,
    `DTSTART:${formatIcsDateTime(event.startDate)}`,
    `DTEND:${formatIcsDateTime(event.endDate)}`,
    `SUMMARY:${escapeIcsValue(event.title)}`,
    `CREATED:${formatIcsDateTime(event.created)}`,
    `LAST-MODIFIED:${formatIcsDateTime(event.lastModified)}`,
  ]

  if (event.description) {
    lines.push(`DESCRIPTION:${escapeIcsValue(event.description)}`)
  }

  if (event.location) {
    lines.push(`LOCATION:${escapeIcsValue(event.location)}`)
  }

  if (event.status) {
    lines.push(`STATUS:${event.status}`)
  }

  if (event.url) {
    lines.push(`URL:${event.url}`)
  }

  if (event.categories && event.categories.length > 0) {
    lines.push(`CATEGORIES:${event.categories.join(',')}`)
  }

  if (event.organizer) {
    lines.push(`ORGANIZER;CN=${escapeIcsValue(event.organizer.name)}:mailto:${event.organizer.email}`)
  }

  // Add alarm (reminder) 1 day before
  lines.push('BEGIN:VALARM')
  lines.push('ACTION:DISPLAY')
  lines.push('DESCRIPTION:Reminder')
  lines.push('TRIGGER:-P1D')
  lines.push('END:VALARM')

  // Add alarm 3 hours before
  lines.push('BEGIN:VALARM')
  lines.push('ACTION:DISPLAY')
  lines.push('DESCRIPTION:Reminder')
  lines.push('TRIGGER:-PT3H')
  lines.push('END:VALARM')

  lines.push('END:VEVENT')

  return lines.join('\r\n')
}

/**
 * Generate a complete ICS calendar file
 */
export function generateIcsCalendar(
  calendarName: string,
  events: IcsEvent[]
): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//GigBook//Musicians Calendar//CS',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeIcsValue(calendarName)}`,
    'X-WR-TIMEZONE:Europe/Prague',
  ]

  // Add timezone definition
  lines.push('BEGIN:VTIMEZONE')
  lines.push('TZID:Europe/Prague')
  lines.push('BEGIN:STANDARD')
  lines.push('DTSTART:19701025T030000')
  lines.push('RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU')
  lines.push('TZOFFSETFROM:+0200')
  lines.push('TZOFFSETTO:+0100')
  lines.push('END:STANDARD')
  lines.push('BEGIN:DAYLIGHT')
  lines.push('DTSTART:19700329T020000')
  lines.push('RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU')
  lines.push('TZOFFSETFROM:+0100')
  lines.push('TZOFFSETTO:+0200')
  lines.push('END:DAYLIGHT')
  lines.push('END:VTIMEZONE')

  // Add events
  for (const event of events) {
    lines.push(generateIcsEvent(event))
  }

  lines.push('END:VCALENDAR')

  return lines.join('\r\n')
}

/**
 * Map gig status to ICS status
 */
function mapGigStatusToIcs(status: string): 'TENTATIVE' | 'CONFIRMED' | 'CANCELLED' {
  switch (status) {
    case 'CONFIRMED':
    case 'COMPLETED':
      return 'CONFIRMED'
    case 'CANCELLED':
      return 'CANCELLED'
    default:
      return 'TENTATIVE'
  }
}

/**
 * Convert gig data to ICS event
 */
export function gigToIcsEvent(gig: {
  id: string
  title: string
  status: string
  eventDate: Date
  eventDuration?: number
  venue?: { name?: string; address?: string; city?: string }
  clientName?: string
  description?: string
  createdAt: Date
  updatedAt: Date
}): IcsEvent {
  const startDate = new Date(gig.eventDate)
  const endDate = new Date(startDate)
  endDate.setMinutes(endDate.getMinutes() + (gig.eventDuration || 120))

  const location = gig.venue
    ? [gig.venue.name, gig.venue.address, gig.venue.city].filter(Boolean).join(', ')
    : undefined

  let description = ''
  if (gig.clientName) {
    description += `Klient: ${gig.clientName}\n`
  }
  if (gig.description) {
    description += `\n${gig.description}`
  }

  return {
    uid: `gig-${gig.id}@gigbook.app`,
    title: gig.title,
    description: description || undefined,
    location,
    startDate,
    endDate,
    created: gig.createdAt,
    lastModified: gig.updatedAt,
    status: mapGigStatusToIcs(gig.status),
    categories: ['Gig', 'Music'],
  }
}
