// Admin system TypeScript types
// For Prisma database models

export interface Customer {
  id: string
  _type?: 'customer'
  _createdAt?: string
  _updatedAt?: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  organization?: string
  organizationType?: 'elementary_school' | 'kindergarten' | 'high_school' | 'cultural_center' | 'municipality' | 'private_company' | 'nonprofit' | 'other'
  address?: {
    street?: string
    city?: string
    postalCode?: string
    country?: string
  }
  billingInfo?: {
    companyName?: string
    ico?: string
    dic?: string
    billingAddress?: string
  }
  tags?: string[]
  notes?: string
  gdprConsent?: {
    marketing: boolean
    dataProcessing: boolean
    consentDate?: string
  }
  createdAt: string
}

export interface OrderItem {
  id: string
  date: string
  startTime?: string
  endTime?: string
  type?: 'performance' | 'game' | 'service'
  performanceId?: string
  gameId?: string
  serviceId?: string
  performance?: {
    id: string
    title: string
    slug: string
    featuredImageUrl?: string
  }
  game?: {
    id: string
    title: string
    slug: string
    featuredImageUrl?: string
  }
  service?: {
    id: string
    title: string
    slug: string
    featuredImageUrl?: string
  }
  price: number
  notes?: string
}

export interface Venue {
  name: string
  street?: string
  city: string
  postalCode?: string
  gpsCoordinates?: {
    lat: number
    lng: number
  }
}

export interface TechnicalRequirements {
  parking?: boolean
  parkingSpaces?: number
  electricity?: boolean
  electricityVoltage?: string
  accommodation?: boolean
  accommodationPersons?: number
  sound?: boolean
  lighting?: boolean
  otherRequirements?: string
}

export interface PricingItem {
  description: string
  amount: number
}

export interface Pricing {
  items?: PricingItem[]
  subtotal?: number
  travelCosts?: number
  discount?: number
  totalPrice?: number
  vatIncluded?: boolean
  notes?: string
}

export interface ContactPerson {
  name?: string
  phone?: string
  email?: string
  ico?: string
  companyName?: string  // Název firmy objednavatele
}

export interface Contacts {
  primary?: ContactPerson
  onSite?: {
    name?: string
    phone?: string
  }
  divadloOnSite?: {
    name?: string
    phone?: string
  }
}

export interface EmailRecipient {
  email: string
  name?: string
  includePricing: boolean
}

export interface InternalNote {
  note: string
  author?: string
  createdAt: string
}

export interface ApprovalInfo {
  approvedBy?: string
  approvedAt?: string
  calendarEventId?: string
  emailsSent?: boolean
}

export interface Documents {
  customerOrderNumber?: string
  contractNumber?: string
}

export type OrderStatus =
  | 'new'
  | 'reviewing'
  | 'awaiting_info'
  | 'quote_sent'
  | 'confirmed'
  | 'approved'
  | 'completed'
  | 'cancelled'

export type OrderSource =
  | 'contact_form'
  | 'manual'
  | 'phone'
  | 'email'
  | 'repeat'

// Způsob platby pro objednávky
export type OrderPaymentMethod =
  | 'deposit'   // Záloha
  | 'invoice'   // Faktura se splatností
  | 'cash'      // Hotovost na místě
  | 'prepaid'   // Platba předem

// Typ dopravy
export type TransportType = 'car' | 'van' | 'train' | 'other'

// Logistika dopravy (interní)
export interface OrderLogistics {
  departureTime?: string        // HH:MM - čas odjezdu na akci
  returnTime?: string           // HH:MM - čas příjezdu zpět
  travelDuration?: number       // minuty (jednosměrně)
  totalKilometers?: number      // km tam a zpět
  transportType?: TransportType
  transportNotes?: string       // poznámky k dopravě
}

export interface Order {
  id: string
    _type?: 'order'
  _createdAt?: string
  _updatedAt?: string
  orderNumber?: string
  customer: {
    _ref: string
    _type: 'reference'
  }
  source: OrderSource
  status: OrderStatus
  eventName?: string
  dates: string[]
  venue: Venue
  arrivalTime?: string
  preparationTime?: number
  eventDuration?: number        // Délka akce v minutách
  items?: OrderItem[]
  technicalRequirements?: TechnicalRequirements
  pricing?: Pricing
  // Payment & Invoicing
  paymentMethod?: OrderPaymentMethod
  paymentDueDate?: string       // ISO date string
  invoiceEmail?: string         // Email pro zaslání faktury
  // Logistics (internal)
  logistics?: OrderLogistics
  contacts?: Contacts
  documents?: Documents
  approvalInfo?: ApprovalInfo
  linkedEvent?: {
    _ref: string
    _type: 'reference'
  }
  contactMessage?: string
  emailRecipients?: EmailRecipient[]
  internalNotes?: InternalNote[]
  // Customer confirmation flow fields
  confirmationToken?: string
  confirmationTokenExp?: string
  confirmedAt?: string
  confirmedByName?: string
  confirmedByEmail?: string
  customerComments?: string
  createdAt: string
  updatedAt?: string
}

export interface InvoiceItem {
  description: string
  quantity: number
  unitPrice: number
  totalPrice?: number
}

export type InvoiceStatus =
  | 'draft'
  | 'sent'
  | 'paid'
  | 'overdue'
  | 'cancelled'

export type PaymentMethod =
  | 'bank_transfer'
  | 'cash'
  | 'card'

export interface Invoice {
  id: string
    _type?: 'invoice'
  _createdAt?: string
  _updatedAt?: string
  invoiceNumber: string
  order: {
    _ref: string
    _type: 'reference'
  }
  customer: {
    _ref: string
    _type: 'reference'
  }
  issueDate: string
  dueDate: string
  items: InvoiceItem[]
  subtotal?: number
  vatRate?: number
  vatAmount?: number
  totalAmount?: number
  paymentMethod?: PaymentMethod
  bankAccount?: string
  variableSymbol?: string
  status: InvoiceStatus
  paidDate?: string
  paidAmount?: number
  pdfFile?: {
    _type: 'file'
    asset: {
      _ref: string
      _type: 'reference'
    }
  }
  notes?: string
  createdAt: string
  // Vyfakturuj integration fields
  vyfakturujId?: number
  vyfakturujNumber?: string
  vyfakturujType?: number
  vyfakturujFlags?: number
  vyfakturujVS?: number
  publicUrl?: string
  onlinePaymentUrl?: string
  iban?: string
  vyfakturujSyncedAt?: string
}

export type CommunicationType =
  | 'email'
  | 'phone'
  | 'sms'
  | 'note'

export type CommunicationDirection =
  | 'outgoing'
  | 'incoming'

export interface Communication {
  id: string
    _type?: 'communication'
  _createdAt?: string
  _updatedAt?: string
  type: CommunicationType
  direction: CommunicationDirection
  order?: {
    _ref: string
    _type: 'reference'
  }
  customer: {
    _ref: string
    _type: 'reference'
  }
  subject?: string
  content: string
  author?: string
  createdAt: string
}

// Populated types (with resolved references)
export interface CustomerPopulated extends Omit<Customer, never> {}

export interface OrderPopulated extends Omit<Order, 'customer' | 'linkedEvent'> {
  customer: CustomerPopulated
  linkedEvent?: any // Event type from existing schemas
  linkedEventId?: string | null
}

export interface InvoicePopulated extends Omit<Invoice, 'order' | 'customer'> {
  order: OrderPopulated
  customer: CustomerPopulated
}

export interface CommunicationPopulated extends Omit<Communication, 'order' | 'customer'> {
  order?: OrderPopulated
  customer: CustomerPopulated
}

// Company settings (for contracts and documents)
export interface CompanyAddress {
  street?: string
  city?: string
  postalCode?: string
}

export interface CompanySettings {
  companyIco?: string           // IČO firmy
  companyDic?: string           // DIČ (i když nejsou plátci)
  companyBankAccount?: string   // Číslo bankovního účtu
  companyFullAddress?: CompanyAddress
}
