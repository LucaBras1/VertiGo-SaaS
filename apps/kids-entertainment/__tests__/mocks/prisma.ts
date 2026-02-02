/**
 * Prisma Mock Utilities
 * Helpers for mocking Prisma queries in tests
 */

import { vi } from 'vitest'

// Mock data factories
export const mockCustomer = (overrides = {}) => ({
  id: 'cust_test_123',
  email: 'parent@example.com',
  firstName: 'Jana',
  lastName: 'Nováková',
  phone: '+420 777 123 456',
  children: [
    {
      name: 'Tomáš',
      age: 7,
      interests: 'fotbal, lego',
      allergies: [],
    },
  ],
  totalPartiesBooked: 1,
  totalSpent: 4500,
  lastPartyDate: new Date('2024-06-15'),
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-06-15'),
  ...overrides,
})

export const mockPackage = (overrides = {}) => ({
  id: 'pkg_test_123',
  title: 'Superhrdina párty',
  slug: 'superhrdina-party',
  description: 'Akční oslava plná superhrdinských aktivit',
  ageRange: { min: 5, max: 10 },
  duration: 180,
  guestCount: { min: 8, max: 15 },
  price: 4500,
  features: ['Kostýmy', 'Soutěže', 'Dort'],
  activities: ['Překážková dráha', 'Honička'],
  isActive: true,
  sortOrder: 1,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
})

export const mockActivity = (overrides = {}) => ({
  id: 'act_test_123',
  name: 'Malování na obličej',
  slug: 'malovani-na-oblicej',
  description: 'Profesionální malování na obličej',
  ageRange: { min: 3, max: 12 },
  duration: 30,
  price: 500,
  isActive: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
})

export const mockParty = (overrides = {}) => ({
  id: 'party_test_123',
  packageId: 'pkg_test_123',
  activityId: null,
  date: new Date('2024-08-15T14:00:00'),
  endDate: new Date('2024-08-15T17:00:00'),
  venue: 'Kavárna U Kocoura, Praha 2',
  childName: 'Tomáš',
  childAge: 7,
  childGender: 'male',
  childInterests: ['fotbal', 'lego'],
  guestCount: 12,
  theme: 'Superhrdina',
  specialRequests: 'Bezlepkový dort',
  allergies: ['ořechy'],
  dietaryRestrictions: ['bezlepková dieta'],
  specialNeeds: null,
  emergencyContact: { name: 'Babička', phone: '+420 777 999 888' },
  parentName: 'Jana Nováková',
  parentPhone: '+420 777 123 456',
  parentEmail: 'parent@example.com',
  status: 'confirmed',
  entertainerId: null,
  internalNotes: null,
  createdAt: new Date('2024-06-01'),
  updatedAt: new Date('2024-06-01'),
  ...overrides,
})

export const mockOrder = (overrides = {}) => ({
  id: 'ord_test_123',
  orderNumber: 'PP2408-ABC123',
  customerId: 'cust_test_123',
  source: 'website',
  status: 'new',
  partyName: 'Tomáš - 7. narozeniny',
  dates: {
    date: '2024-08-15',
    startTime: '14:00',
    duration: 180,
  },
  venue: 'Kavárna U Kocoura, Praha 2',
  guestCount: 12,
  childInfo: {
    name: 'Tomáš',
    age: 7,
    gender: 'male',
    interests: 'fotbal, lego',
    allergies: ['ořechy'],
  },
  specialRequests: 'Bezlepkový dort',
  allergyNotes: 'ořechy',
  pricing: {
    subtotal: 4500,
    total: 4500,
    deposit: 1350,
  },
  contacts: {
    parent: {
      name: 'Jana Nováková',
      phone: '+420 777 123 456',
      email: 'parent@example.com',
    },
    emergency: { name: 'Babička', phone: '+420 777 999 888' },
  },
  linkedPartyId: 'party_test_123',
  createdAt: new Date('2024-06-01'),
  updatedAt: new Date('2024-06-01'),
  ...overrides,
})

export const mockInvoice = (overrides = {}) => ({
  id: 'inv_test_123',
  invoiceNumber: 'PP-INV-2024-001',
  orderId: 'ord_test_123',
  customerId: 'cust_test_123',
  type: 'DEPOSIT',
  status: 'PAID',
  issueDate: new Date('2024-06-01'),
  dueDate: new Date('2024-06-15'),
  paidDate: new Date('2024-06-02'),
  subtotal: 1350,
  taxRate: 21,
  taxAmount: 234,
  total: 1350,
  currency: 'CZK',
  items: [
    {
      description: 'Záloha - Superhrdina párty',
      quantity: 1,
      unitPrice: 1350,
      total: 1350,
    },
  ],
  stripePaymentIntentId: 'pi_test_123',
  stripeInvoiceId: null,
  notes: null,
  pdfUrl: null,
  sentAt: new Date('2024-06-01'),
  createdAt: new Date('2024-06-01'),
  updatedAt: new Date('2024-06-02'),
  ...overrides,
})

export const mockSafetyChecklist = (overrides = {}) => ({
  id: 'safety_test_123',
  partyId: 'party_test_123',
  orderId: 'ord_test_123',
  allergyReview: true,
  emergencyContacts: true,
  venueAssessment: true,
  equipmentCheck: true,
  staffBriefing: true,
  notes: {
    createdAt: new Date().toISOString(),
    safetyAcknowledged: true,
    allergies: ['ořechy'],
    specialNeeds: null,
  },
  completedAt: new Date('2024-08-15T13:00:00'),
  createdAt: new Date('2024-06-01'),
  updatedAt: new Date('2024-08-15'),
  ...overrides,
})

export const mockEntertainer = (overrides = {}) => ({
  id: 'ent_test_123',
  name: 'Klaun Pepíno',
  email: 'pepino@partypal.cz',
  phone: '+420 777 555 444',
  specialties: ['klaunování', 'magie', 'balónky'],
  availability: {
    monday: ['14:00-20:00'],
    saturday: ['10:00-20:00'],
    sunday: ['10:00-18:00'],
  },
  rating: 4.8,
  isActive: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
})

// Helper to set up prisma mock returns
export function setupPrismaMock(prisma: any, config: {
  customers?: any[]
  packages?: any[]
  activities?: any[]
  parties?: any[]
  orders?: any[]
  invoices?: any[]
}) {
  if (config.customers) {
    prisma.customer.findMany.mockResolvedValue(config.customers)
    prisma.customer.findUnique.mockImplementation(({ where }: any) => {
      const found = config.customers?.find(c =>
        c.id === where.id || c.email === where.email
      )
      return Promise.resolve(found || null)
    })
  }

  if (config.packages) {
    prisma.package.findMany.mockResolvedValue(config.packages)
    prisma.package.findUnique.mockImplementation(({ where }: any) => {
      const found = config.packages?.find(p =>
        p.id === where.id || p.slug === where.slug
      )
      return Promise.resolve(found || null)
    })
  }

  if (config.activities) {
    prisma.activity.findMany.mockResolvedValue(config.activities)
    prisma.activity.findUnique.mockImplementation(({ where }: any) => {
      const found = config.activities?.find(a =>
        a.id === where.id || a.slug === where.slug
      )
      return Promise.resolve(found || null)
    })
  }

  if (config.parties) {
    prisma.party.findMany.mockResolvedValue(config.parties)
    prisma.party.findUnique.mockImplementation(({ where }: any) => {
      const found = config.parties?.find(p => p.id === where.id)
      return Promise.resolve(found || null)
    })
  }

  if (config.orders) {
    prisma.order.findMany.mockResolvedValue(config.orders)
    prisma.order.findUnique.mockImplementation(({ where }: any) => {
      const found = config.orders?.find(o =>
        o.id === where.id || o.orderNumber === where.orderNumber
      )
      return Promise.resolve(found || null)
    })
  }

  if (config.invoices) {
    prisma.invoice.findMany.mockResolvedValue(config.invoices)
    prisma.invoice.findUnique.mockImplementation(({ where }: any) => {
      const found = config.invoices?.find(i =>
        i.id === where.id || i.invoiceNumber === where.invoiceNumber
      )
      return Promise.resolve(found || null)
    })
  }
}
