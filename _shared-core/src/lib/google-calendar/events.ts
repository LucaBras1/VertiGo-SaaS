// Google Calendar Events Management

import { google } from 'googleapis'
import { format } from 'date-fns'
import { cs } from 'date-fns/locale'
import { getAuthenticatedClient, getGoogleCalendarSettings } from './auth'
import type { CreateEventParams, CalendarEvent, OrderForCalendar, ParticipantForCalendar, SettingsForCalendar } from './types'

const BASE_URL = process.env.NEXTAUTH_URL || 'https://divadlo-studna.cz'

function formatBoolean(value: boolean | undefined | null): string {
  return value ? 'Ano' : 'Ne'
}

function buildGoogleMapsUrl(gps: { lat: number; lng: number } | undefined): string {
  if (!gps) return ''
  return `https://www.google.com/maps?q=${gps.lat},${gps.lng}`
}

function buildItemUrl(item: OrderForCalendar['items'][0]): string | null {
  if (item.performance?.slug) {
    return `${BASE_URL}/predstaveni/${item.performance.slug}`
  }
  if (item.game?.slug) {
    return `${BASE_URL}/hry/${item.game.slug}`
  }
  if (item.service?.slug) {
    return `${BASE_URL}/sluzby/${item.service.slug}`
  }
  return null
}

function buildProgramSection(items: OrderForCalendar['items']): string {
  if (!items.length) return '   (bez programu)'

  return items.map((item) => {
    const title = item.performance?.title || item.game?.title || item.service?.title || 'Bez nazvu'
    const url = buildItemUrl(item)
    const time = item.startTime ? `${item.startTime}` : ''
    const endTime = item.endTime ? ` - ${item.endTime}` : ''
    const dateStr = format(new Date(item.date), 'd.M.yyyy', { locale: cs })

    if (url) {
      return `   - ${time}${endTime} ${title} (${dateStr})\n     ${url}`
    }
    return `   - ${time}${endTime} ${title} (${dateStr})`
  }).join('\n')
}

function buildTechnicalRequirementsSection(tech: OrderForCalendar['technicalRequirements']): string {
  if (!tech) return '   (bez pozadavku)'

  const lines: string[] = []
  if (tech.parking !== undefined) {
    lines.push(`   - Parkovani: ${formatBoolean(tech.parking)}${tech.parkingSpaces ? ` (${tech.parkingSpaces} mist)` : ''}`)
  }
  if (tech.electricity !== undefined) {
    lines.push(`   - Elektrina: ${formatBoolean(tech.electricity)}${tech.electricityVoltage ? ` (${tech.electricityVoltage}V)` : ''}`)
  }
  if (tech.accommodation !== undefined) {
    lines.push(`   - Ubytovani: ${formatBoolean(tech.accommodation)}${tech.accommodationPersons ? ` (${tech.accommodationPersons} osob)` : ''}`)
  }
  if (tech.sound !== undefined) {
    lines.push(`   - Zvuk: ${formatBoolean(tech.sound)}`)
  }
  if (tech.lighting !== undefined) {
    lines.push(`   - Osvetleni: ${formatBoolean(tech.lighting)}`)
  }
  if (tech.otherRequirements) {
    lines.push(`   - Ostatni: ${tech.otherRequirements}`)
  }

  return lines.length ? lines.join('\n') : '   (bez pozadavku)'
}

function buildEmployeeEventDescription(
  order: OrderForCalendar,
  settings: SettingsForCalendar
): string {
  const gpsUrl = buildGoogleMapsUrl(order.venue.gpsCoordinates)
  const datesStr = order.dates.map((d) => format(new Date(d), 'd. MMMM yyyy', { locale: cs })).join(', ')

  let description = `
===============================================
DATUM AKCE: ${datesStr}
MESTO: ${order.venue.city || '-'}
MISTO AKCE: ${order.venue.name}${order.venue.street ? `, ${order.venue.street}` : ''}
${gpsUrl ? `GPS: ${gpsUrl}` : ''}
===============================================

NAZEV AKCE: ${order.eventName || `Akce #${order.orderNumber}`}
CAS PRIJEZDU NA AKCI: ${order.arrivalTime || '-'}
PROGRAM (harmonogram):
${buildProgramSection(order.items)}
TECHNICKE POZADAVKY:
${buildTechnicalRequirementsSection(order.technicalRequirements)}
DELKA AKCE: ${order.eventDuration ? `${order.eventDuration} min` : '-'}
CAS PRIPRAVY: ${order.preparationTime ? `${order.preparationTime} min` : '-'}

===============================================
OBJEDNAVATEL
   IC: ${order.customer?.billingInfo?.ico || order.contacts?.primary?.ico || '-'}
   Firma: ${order.customer?.organization || order.contacts?.primary?.companyName || '-'}
   Email: ${order.customer?.email || order.contacts?.primary?.email || '-'}
   Tel: ${order.customer?.phone || order.contacts?.primary?.phone || '-'}
   Kontakt na akci: ${order.contacts?.onSite?.name || '-'} / ${order.contacts?.onSite?.phone || '-'}
   Objednavka c.: ${order.orderNumber}
   Smlouva: ${order.documents?.contractNumber || '-'}

DODAVATEL (Divadlo Studna)
   IC: ${settings.companyIco || '-'}
   Firma: ${settings.offerEmailCompanyName || 'Divadlo Studna'}
   Tel: ${settings.contactPhone || '-'}
   Kontakt na akci: ${order.contacts?.divadloOnSite?.name || '-'} / ${order.contacts?.divadloOnSite?.phone || '-'}

===============================================
DOPRAVA
   Typ: ${order.logistics?.transportType || '-'}
   Odjezd na akci: ${order.logistics?.departureTime || '-'}
   Prijezd zpet: ${order.logistics?.returnTime || '-'}
   Delka cesty: ${order.logistics?.travelDuration ? `${order.logistics.travelDuration} min` : '-'}
   Kilometry tam/zpet: ${order.logistics?.totalKilometers ? `${order.logistics.totalKilometers} km` : '-'}
   Poznamky: ${order.logistics?.transportNotes || '-'}

INTERNI POZNAMKY:
${order.internalNotes?.map((n) => `- ${n.note}`).join('\n') || '(zadne)'}
===============================================
`.trim()

  return description
}

function buildCustomerEventDescription(
  order: OrderForCalendar,
  settings: SettingsForCalendar,
  includePricing: boolean
): string {
  const gpsUrl = buildGoogleMapsUrl(order.venue.gpsCoordinates)
  const datesStr = order.dates.map((d) => format(new Date(d), 'd. MMMM yyyy', { locale: cs })).join(', ')

  let description = `
===============================================
DATUM AKCE: ${datesStr}
MESTO: ${order.venue.city || '-'}
MISTO AKCE: ${order.venue.name}${order.venue.street ? `, ${order.venue.street}` : ''}
${gpsUrl ? `GPS: ${gpsUrl}` : ''}
===============================================

NAZEV AKCE: ${order.eventName || `Akce #${order.orderNumber}`}
CAS PRIJEZDU NA AKCI: ${order.arrivalTime || '-'}
PROGRAM (harmonogram):
${buildProgramSection(order.items)}
TECHNICKE POZADAVKY:
${buildTechnicalRequirementsSection(order.technicalRequirements)}
DELKA AKCE: ${order.eventDuration ? `${order.eventDuration} min` : '-'}
CAS PRIPRAVY: ${order.preparationTime ? `${order.preparationTime} min` : '-'}

===============================================
OBJEDNAVATEL
   IC: ${order.customer?.billingInfo?.ico || order.contacts?.primary?.ico || '-'}
   Firma: ${order.customer?.organization || order.contacts?.primary?.companyName || '-'}
   Email: ${order.customer?.email || order.contacts?.primary?.email || '-'}
   Tel: ${order.customer?.phone || order.contacts?.primary?.phone || '-'}
   Kontakt na akci: ${order.contacts?.onSite?.name || '-'} / ${order.contacts?.onSite?.phone || '-'}
   Objednavka c.: ${order.orderNumber}
   Smlouva: ${order.documents?.contractNumber || '-'}

DODAVATEL (Divadlo Studna)
   IC: ${settings.companyIco || '-'}
   Firma: ${settings.offerEmailCompanyName || 'Divadlo Studna'}
   Tel: ${settings.contactPhone || '-'}
   Kontakt na akci: ${order.contacts?.divadloOnSite?.name || '-'} / ${order.contacts?.divadloOnSite?.phone || '-'}
`.trim()

  // Add pricing section only if includePricing is true
  if (includePricing && order.pricing) {
    const paymentMethodLabel = {
      deposit: 'Zaloha',
      invoice: 'Faktura',
      cash: 'Hotovost',
      prepaid: 'Predplaceno',
    }[order.paymentMethod || ''] || order.paymentMethod || '-'

    description += `

===============================================
CENA (nejsme platci DPH)
   Program: ${order.pricing.subtotal?.toLocaleString('cs-CZ') || 0} Kc
   Doprava: ${order.pricing.travelCosts?.toLocaleString('cs-CZ') || 0} Kc
   ${order.pricing.discount ? `Sleva: -${order.pricing.discount.toLocaleString('cs-CZ')} Kc\n   ` : ''}--------------------
   CELKEM: ${order.pricing.totalPrice?.toLocaleString('cs-CZ') || 0} Kc

   Zpusob platby: ${paymentMethodLabel}
   Faktura na email: ${order.invoiceEmail || order.customer?.email || '-'}
===============================================`
  }

  return description
}

function buildEventLocation(venue: OrderForCalendar['venue']): string {
  const parts: string[] = []
  if (venue.name) parts.push(venue.name)
  if (venue.street) parts.push(venue.street)
  if (venue.city) parts.push(`${venue.postalCode || ''} ${venue.city}`.trim())

  return parts.join(', ')
}

export async function createCalendarEvent(params: CreateEventParams): Promise<string> {
  const { order, participant, settings } = params

  const config = await getGoogleCalendarSettings()
  if (!config?.calendarId) {
    throw new Error('Google Calendar not configured or no calendar selected')
  }

  const auth = await getAuthenticatedClient()
  const calendar = google.calendar({ version: 'v3', auth })

  // Build description based on participant type
  const isEmployee = participant.type === 'employee'
  const description = isEmployee
    ? buildEmployeeEventDescription(order, settings)
    : buildCustomerEventDescription(order, settings, participant.includePricing)

  // Calculate event times
  // Use first date from dates array
  const eventDate = new Date(order.dates[0])

  // Set start time from arrivalTime or default to 9:00
  let startHour = 9
  let startMinute = 0
  if (order.arrivalTime) {
    const [h, m] = order.arrivalTime.split(':')
    startHour = parseInt(h, 10) || 9
    startMinute = parseInt(m, 10) || 0
  }
  eventDate.setHours(startHour, startMinute, 0, 0)

  // Calculate end time
  const endDate = new Date(eventDate)
  const durationMinutes = order.eventDuration || 120 // Default 2 hours
  endDate.setMinutes(endDate.getMinutes() + durationMinutes)

  const event: CalendarEvent = {
    summary: `${order.eventName || 'Akce'} - ${order.orderNumber}`,
    description,
    location: buildEventLocation(order.venue),
    start: {
      dateTime: eventDate.toISOString(),
      timeZone: 'Europe/Prague',
    },
    end: {
      dateTime: endDate.toISOString(),
      timeZone: 'Europe/Prague',
    },
    attendees: [
      {
        email: participant.email,
        displayName: participant.name || participant.teamMember
          ? `${participant.teamMember?.firstName} ${participant.teamMember?.lastName}`
          : undefined,
      },
    ],
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 }, // 1 day before
        { method: 'popup', minutes: 60 },       // 1 hour before
      ],
    },
  }

  const response = await calendar.events.insert({
    calendarId: config.calendarId,
    requestBody: event,
    sendNotifications: true,
    sendUpdates: 'all',
  })

  if (!response.data.id) {
    throw new Error('Failed to create calendar event')
  }

  return response.data.id
}

export async function deleteCalendarEvent(eventId: string): Promise<void> {
  const config = await getGoogleCalendarSettings()
  if (!config?.calendarId) {
    throw new Error('Google Calendar not configured')
  }

  const auth = await getAuthenticatedClient()
  const calendar = google.calendar({ version: 'v3', auth })

  await calendar.events.delete({
    calendarId: config.calendarId,
    eventId,
    sendNotifications: true,
    sendUpdates: 'all',
  })
}

export async function updateCalendarEvent(
  eventId: string,
  params: CreateEventParams
): Promise<void> {
  const { order, participant, settings } = params

  const config = await getGoogleCalendarSettings()
  if (!config?.calendarId) {
    throw new Error('Google Calendar not configured')
  }

  const auth = await getAuthenticatedClient()
  const calendar = google.calendar({ version: 'v3', auth })

  const isEmployee = participant.type === 'employee'
  const description = isEmployee
    ? buildEmployeeEventDescription(order, settings)
    : buildCustomerEventDescription(order, settings, participant.includePricing)

  const eventDate = new Date(order.dates[0])
  let startHour = 9
  let startMinute = 0
  if (order.arrivalTime) {
    const [h, m] = order.arrivalTime.split(':')
    startHour = parseInt(h, 10) || 9
    startMinute = parseInt(m, 10) || 0
  }
  eventDate.setHours(startHour, startMinute, 0, 0)

  const endDate = new Date(eventDate)
  const durationMinutes = order.eventDuration || 120
  endDate.setMinutes(endDate.getMinutes() + durationMinutes)

  await calendar.events.update({
    calendarId: config.calendarId,
    eventId,
    requestBody: {
      summary: `${order.eventName || 'Akce'} - ${order.orderNumber}`,
      description,
      location: buildEventLocation(order.venue),
      start: {
        dateTime: eventDate.toISOString(),
        timeZone: 'Europe/Prague',
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: 'Europe/Prague',
      },
    },
    sendNotifications: true,
    sendUpdates: 'all',
  })
}
