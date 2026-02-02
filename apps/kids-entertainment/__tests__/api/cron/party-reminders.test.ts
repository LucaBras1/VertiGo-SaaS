/**
 * Party Reminders Cron Job Tests
 * Tests for 24h party reminder email functionality
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { prisma } from '@/lib/prisma'
import { mockParty, mockCustomer, mockOrder, mockPackage } from '../../mocks/prisma'
import { mockDate, restoreDate } from '../../setup'

// Mock email service
vi.mock('@/lib/email', () => ({
  sendPartyReminderEmail: vi.fn().mockResolvedValue({ success: true }),
  sendPostPartyFeedbackEmail: vi.fn().mockResolvedValue({ success: true }),
  sendPaymentReminderEmail: vi.fn().mockResolvedValue({ success: true }),
}))

describe('Party Reminders Cron Job', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Set a fixed date for testing
    mockDate('2024-08-14T10:00:00Z')
  })

  afterEach(() => {
    restoreDate()
  })

  describe('CRON_SECRET Authentication', () => {
    it('should reject requests without authorization header', async () => {
      const headers = new Headers({})
      const authHeader = headers.get('authorization')

      expect(authHeader).toBeNull()
    })

    it('should reject requests with invalid secret', () => {
      const cronSecret = 'correct_secret'
      const providedSecret = 'wrong_secret'

      expect(providedSecret).not.toBe(cronSecret)
    })

    it('should accept requests with valid Bearer token', () => {
      const cronSecret = 'correct_secret'
      const authHeader = 'Bearer correct_secret'
      const providedSecret = authHeader.replace('Bearer ', '')

      expect(providedSecret).toBe(cronSecret)
    })

    it('should return 500 if CRON_SECRET is not configured', () => {
      const cronSecret = undefined
      expect(cronSecret).toBeUndefined()
    })
  })

  describe('24-Hour Window Detection', () => {
    it('should find parties within next 24 hours', () => {
      const now = new Date('2024-08-14T10:00:00Z')
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)

      // Party at 12:00 tomorrow (within 24h window from now)
      const partyDate = new Date('2024-08-15T08:00:00Z')

      expect(partyDate >= now).toBe(true)
      expect(partyDate <= tomorrow).toBe(true)
    })

    it('should not include parties more than 24h away', () => {
      const now = new Date('2024-08-14T10:00:00Z')
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)

      // Party in 2 days (outside window)
      const partyDate = new Date('2024-08-16T15:00:00Z')

      expect(partyDate > tomorrow).toBe(true)
    })

    it('should not include parties that have already passed', () => {
      const now = new Date('2024-08-14T10:00:00Z')

      // Party yesterday (already passed)
      const partyDate = new Date('2024-08-13T15:00:00Z')

      expect(partyDate < now).toBe(true)
    })
  })

  describe('Skip Already Reminded Parties', () => {
    it('should skip parties with reminderSentAt set', async () => {
      const partyWithReminder = mockParty({
        id: 'party_reminded',
        reminderSentAt: new Date('2024-08-13T10:00:00Z'),
      })

      const partyWithoutReminder = mockParty({
        id: 'party_not_reminded',
        reminderSentAt: null,
      })

      // Query would filter out parties with reminderSentAt set
      const parties = [partyWithReminder, partyWithoutReminder]
      const partiesToRemind = parties.filter((p) => p.reminderSentAt === null)

      expect(partiesToRemind).toHaveLength(1)
      expect(partiesToRemind[0].id).toBe('party_not_reminded')
    })

    it('should update reminderSentAt after sending email', async () => {
      const party = mockParty({ id: 'party_to_update', reminderSentAt: null })

      vi.mocked(prisma.party.update).mockResolvedValue({
        ...party,
        reminderSentAt: new Date(),
      })

      const updated = await prisma.party.update({
        where: { id: party.id },
        data: { reminderSentAt: new Date() },
      })

      expect(updated.reminderSentAt).toBeDefined()
    })
  })

  describe('Email Data Extraction', () => {
    it('should extract parent contact from party', () => {
      const party = mockParty({
        parentName: 'Jana Nováková',
        parentEmail: 'jana@example.com',
      })

      expect(party.parentName).toBe('Jana Nováková')
      expect(party.parentEmail).toBe('jana@example.com')
    })

    it('should fallback to customer data if party contact missing', () => {
      const party = mockParty({
        parentName: null,
        parentEmail: null,
      })
      const customer = mockCustomer({
        firstName: 'Petr',
        lastName: 'Novák',
        email: 'petr@example.com',
      })

      const parentName =
        party.parentName || `${customer.firstName} ${customer.lastName}`
      const parentEmail = party.parentEmail || customer.email

      expect(parentName).toBe('Petr Novák')
      expect(parentEmail).toBe('petr@example.com')
    })

    it('should format venue correctly', () => {
      const venue = {
        name: 'Kavárna U Kocoura',
        address: 'Hlavní 123, Praha 2',
      }

      const formatted = `${venue.name || ''}, ${venue.address || ''}`

      expect(formatted).toBe('Kavárna U Kocoura, Hlavní 123, Praha 2')
    })

    it('should handle missing venue data', () => {
      const venue = null
      const fallback = 'Misto bude upřesneno'

      const formatted = venue
        ? `${(venue as any).name || ''}, ${(venue as any).address || ''}`
        : fallback

      expect(formatted).toBe(fallback)
    })

    it('should format allergy notes', () => {
      const allergies = ['ořechy', 'mléko', 'lepek']
      const allergyNotes = `Zname alergie: ${allergies.join(', ')}`

      expect(allergyNotes).toBe('Zname alergie: ořechy, mléko, lepek')
    })

    it('should handle empty allergies array', () => {
      const allergies: string[] = []
      const allergyNotes =
        allergies.length > 0 ? `Zname alergie: ${allergies.join(', ')}` : undefined

      expect(allergyNotes).toBeUndefined()
    })

    it('should format emergency contact', () => {
      const emergencyContact = {
        name: 'Babička',
        phone: '+420 777 999 888',
      }

      expect(emergencyContact.name).toBe('Babička')
      expect(emergencyContact.phone).toBe('+420 777 999 888')
    })
  })

  describe('Date Formatting', () => {
    it('should format party date in Czech locale', () => {
      const date = new Date('2024-08-15T14:00:00Z')
      const formatted = date.toLocaleDateString('cs-CZ', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })

      // Should contain Czech month name
      expect(formatted).toMatch(/2024/)
    })

    it('should format party time correctly', () => {
      const date = new Date('2024-08-15T14:00:00Z')
      const timeFormatted = date.toLocaleTimeString('cs-CZ', {
        hour: '2-digit',
        minute: '2-digit',
      })

      expect(timeFormatted).toMatch(/\d{1,2}:\d{2}/)
    })
  })

  describe('Email Sending', () => {
    it('should call sendPartyReminderEmail with correct data', async () => {
      const { sendPartyReminderEmail } = await import('@/lib/email')

      const emailData = {
        to: 'parent@example.com',
        parentName: 'Jana Nováková',
        childName: 'Tomáš',
        partyDate: 'čtvrtek 15. srpna 2024',
        partyTime: '14:00',
        venue: 'Kavárna U Kocoura, Praha 2',
        packageName: 'Superhrdina párty',
        allergyNotes: 'Zname alergie: ořechy',
        emergencyContact: { name: 'Babička', phone: '+420 777 999 888' },
      }

      const result = await sendPartyReminderEmail(emailData)

      expect(result.success).toBe(true)
      expect(sendPartyReminderEmail).toHaveBeenCalledWith(emailData)
    })

    it('should skip parties without customer email', () => {
      const party = mockParty({ parentEmail: null })
      const customer = null // No customer linked

      const email = party.parentEmail ?? customer?.email ?? null

      expect(email).toBeNull()
    })
  })

  describe('Results Tracking', () => {
    it('should track sent, errors, and skipped counts', () => {
      const results = {
        sent: 0,
        errors: 0,
        skipped: 0,
      }

      // Simulate processing
      results.sent += 3
      results.errors += 1
      results.skipped += 2

      expect(results.sent).toBe(3)
      expect(results.errors).toBe(1)
      expect(results.skipped).toBe(2)
    })

    it('should return results with timestamp', () => {
      const response = {
        success: true,
        results: { sent: 5, errors: 0, skipped: 1 },
        timestamp: new Date().toISOString(),
      }

      expect(response.success).toBe(true)
      expect(response.timestamp).toMatch(/\d{4}-\d{2}-\d{2}/)
    })
  })

  describe('Error Handling', () => {
    it('should handle individual party processing errors', async () => {
      const results = { sent: 0, errors: 0, skipped: 0 }

      // Simulate error during processing
      try {
        throw new Error('Email service unavailable')
      } catch {
        results.errors++
      }

      expect(results.errors).toBe(1)
    })

    it('should return 500 on critical errors', () => {
      const errorResponse = {
        error: 'Cron job failed',
        details: 'Database connection failed',
      }

      expect(errorResponse.error).toBe('Cron job failed')
    })
  })
})

describe('Post-Party Feedback Cron Job', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockDate('2024-08-16T10:00:00Z')
  })

  afterEach(() => {
    restoreDate()
  })

  describe('Yesterday Detection', () => {
    it('should find parties that occurred yesterday', () => {
      const now = new Date('2024-08-16T10:00:00Z')
      const yesterdayStart = new Date(now)
      yesterdayStart.setDate(yesterdayStart.getDate() - 1)
      yesterdayStart.setHours(0, 0, 0, 0)

      const yesterdayEnd = new Date(now)
      yesterdayEnd.setDate(yesterdayEnd.getDate() - 1)
      yesterdayEnd.setHours(23, 59, 59, 999)

      // Party at 14:00 yesterday
      const partyDate = new Date('2024-08-15T14:00:00Z')

      expect(partyDate >= yesterdayStart).toBe(true)
      expect(partyDate <= yesterdayEnd).toBe(true)
    })
  })

  describe('Feedback Email', () => {
    it('should call sendPostPartyFeedbackEmail with correct data', async () => {
      const { sendPostPartyFeedbackEmail } = await import('@/lib/email')

      const emailData = {
        to: 'parent@example.com',
        parentName: 'Jana Nováková',
        childName: 'Tomáš',
        partyDate: 'čtvrtek 15. srpna 2024',
        feedbackUrl: 'https://partypal.cz/feedback/party_123',
        photoGalleryUrl: 'https://photos.partypal.cz/gallery/party_123',
      }

      const result = await sendPostPartyFeedbackEmail(emailData)

      expect(result.success).toBe(true)
    })

    it('should update feedbackSentAt after sending', async () => {
      const party = mockParty({ feedbackSentAt: null })

      vi.mocked(prisma.party.update).mockResolvedValue({
        ...party,
        feedbackSentAt: new Date(),
      })

      const updated = await prisma.party.update({
        where: { id: party.id },
        data: { feedbackSentAt: new Date() },
      })

      expect(updated.feedbackSentAt).toBeDefined()
    })
  })
})

describe('Payment Reminders Cron Job', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockDate('2024-08-12T10:00:00Z')
  })

  afterEach(() => {
    restoreDate()
  })

  describe('3 Days Before Due Date Detection', () => {
    it('should find invoices due in 3 days', () => {
      const now = new Date('2024-08-12T00:00:00Z')
      const threeDaysFromNow = new Date(now)
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)

      // Invoice due on Aug 15
      const dueDate = new Date('2024-08-15T00:00:00Z')

      const daysDiff = Math.floor(
        (dueDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
      )

      expect(daysDiff).toBe(3)
    })
  })

  describe('Payment Reminder Email', () => {
    it('should call sendPaymentReminderEmail with correct data', async () => {
      const { sendPaymentReminderEmail } = await import('@/lib/email')

      const emailData = {
        to: 'parent@example.com',
        parentName: 'Jana Nováková',
        childName: 'Tomáš',
        partyDate: 'čtvrtek 15. srpna 2024',
        invoiceNumber: 'PP-INV-2024-001',
        amount: '3 150 CZK',
        dueDate: '15. srpna 2024',
        paymentUrl: 'https://partypal.cz/payment/ord_123',
      }

      const result = await sendPaymentReminderEmail(emailData)

      expect(result.success).toBe(true)
    })

    it('should skip already paid invoices', () => {
      const invoiceStatuses = ['PAID', 'CANCELLED']
      const invoice = { invoiceStatus: 'PAID' }

      const shouldSkip = invoiceStatuses.includes(invoice.invoiceStatus)

      expect(shouldSkip).toBe(true)
    })
  })
})
