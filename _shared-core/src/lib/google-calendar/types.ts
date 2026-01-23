// Google Calendar Types

export interface CalendarEventAttendee {
  email: string
  displayName?: string
  responseStatus?: 'needsAction' | 'declined' | 'tentative' | 'accepted'
}

export interface CalendarEventReminder {
  method: 'email' | 'popup'
  minutes: number
}

export interface CalendarEvent {
  id?: string
  summary: string
  description: string
  location?: string
  start: {
    dateTime: string
    timeZone: string
  }
  end: {
    dateTime: string
    timeZone: string
  }
  attendees?: CalendarEventAttendee[]
  reminders?: {
    useDefault: boolean
    overrides?: CalendarEventReminder[]
  }
}

export interface CreateEventParams {
  order: OrderForCalendar
  participant: ParticipantForCalendar
  settings: SettingsForCalendar
}

export interface OrderForCalendar {
  id: string
  orderNumber: string
  eventName?: string | null
  dates: string[]
  arrivalTime?: string | null
  preparationTime?: number | null
  eventDuration?: number | null
  venue: {
    name: string
    street?: string
    city?: string
    postalCode?: string
    gpsCoordinates?: { lat: number; lng: number }
  }
  items: Array<{
    id: string
    date: string
    startTime?: string | null
    endTime?: string | null
    price: number
    notes?: string | null
    performance?: { title: string; slug: string } | null
    game?: { title: string; slug: string } | null
    service?: { title: string; slug: string } | null
  }>
  technicalRequirements?: {
    parking?: boolean
    parkingSpaces?: number
    electricity?: boolean
    electricityVoltage?: number
    accommodation?: boolean
    accommodationPersons?: number
    sound?: boolean
    lighting?: boolean
    otherRequirements?: string
  } | null
  pricing?: {
    subtotal?: number
    travelCosts?: number
    discount?: number
    totalPrice?: number
    vatIncluded?: boolean
  } | null
  paymentMethod?: string | null
  invoiceEmail?: string | null
  logistics?: {
    transportType?: string
    departureTime?: string
    returnTime?: string
    travelDuration?: number
    totalKilometers?: number
    transportNotes?: string
  } | null
  contacts?: {
    primary?: { name?: string; phone?: string; email?: string; ico?: string; companyName?: string }
    onSite?: { name?: string; phone?: string }
    divadloOnSite?: { name?: string; phone?: string }
  } | null
  documents?: {
    customerOrderNumber?: string
    contractNumber?: string
  } | null
  internalNotes?: Array<{ note: string; author?: string; createdAt?: string }> | null
  customer?: {
    firstName: string
    lastName: string
    email: string
    phone?: string | null
    organization?: string | null
    billingInfo?: { ico?: string; companyName?: string } | null
  } | null
}

export interface ParticipantForCalendar {
  id: string
  type: 'employee' | 'customer' | 'external'
  name?: string | null
  email: string
  phone?: string | null
  includePricing: boolean
  teamMember?: {
    firstName: string
    lastName: string
    role: string
    phone?: string | null
  } | null
}

export interface SettingsForCalendar {
  companyIco?: string | null
  offerEmailCompanyName?: string | null
  offerEmailCompanyEmail?: string | null
  offerEmailCompanyWeb?: string | null
  contactPhone?: string | null
}

export interface GoogleCalendarConfig {
  clientId: string
  clientSecret: string
  refreshToken?: string
  accessToken?: string
  tokenExpiry?: Date
  calendarId?: string
}
