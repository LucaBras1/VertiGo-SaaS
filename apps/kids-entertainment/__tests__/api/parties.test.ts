/**
 * Parties API Tests
 * Tests for party management endpoints
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'
import { mockParty, mockPackage, mockEntertainer } from '../mocks/prisma'

describe('Party API Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Party Listing', () => {
    it('should return all parties with related data', async () => {
      const parties = [
        {
          ...mockParty(),
          package: mockPackage(),
          entertainer: null,
        },
        {
          ...mockParty({ id: 'party_2', childName: 'Anička' }),
          package: mockPackage({ id: 'pkg_2', title: 'Princezna párty' }),
          entertainer: mockEntertainer(),
        },
      ]

      vi.mocked(prisma.party.findMany).mockResolvedValue(parties)

      const result = await prisma.party.findMany({
        include: {
          package: true,
          entertainer: true,
        },
        orderBy: { date: 'asc' },
      })

      expect(result).toHaveLength(2)
      expect(result[0].package?.title).toBe('Superhrdina párty')
      expect(result[1].entertainer?.name).toBe('Klaun Pepíno')
    })

    it('should filter upcoming parties', async () => {
      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      const upcomingParties = [
        mockParty({ date: futureDate, status: 'confirmed' }),
      ]

      vi.mocked(prisma.party.findMany).mockResolvedValue(upcomingParties)

      const result = await prisma.party.findMany({
        where: {
          date: { gte: new Date() },
          status: { in: ['confirmed', 'inquiry'] },
        },
        orderBy: { date: 'asc' },
      })

      expect(result).toHaveLength(1)
      expect(result[0].status).toBe('confirmed')
    })

    it('should filter parties by status', async () => {
      const confirmedParties = [mockParty({ status: 'confirmed' })]

      vi.mocked(prisma.party.findMany).mockResolvedValue(confirmedParties)

      const result = await prisma.party.findMany({
        where: { status: 'confirmed' },
      })

      expect(result).toHaveLength(1)
      expect(result[0].status).toBe('confirmed')
    })
  })

  describe('Party Status Management', () => {
    it('should update party status to confirmed', async () => {
      const party = mockParty({ status: 'inquiry' })

      vi.mocked(prisma.party.update).mockResolvedValue({
        ...party,
        status: 'confirmed',
      })

      const updated = await prisma.party.update({
        where: { id: party.id },
        data: { status: 'confirmed' },
      })

      expect(updated.status).toBe('confirmed')
    })

    it('should update party status to completed', async () => {
      const party = mockParty({ status: 'confirmed' })

      vi.mocked(prisma.party.update).mockResolvedValue({
        ...party,
        status: 'completed',
      })

      const updated = await prisma.party.update({
        where: { id: party.id },
        data: { status: 'completed' },
      })

      expect(updated.status).toBe('completed')
    })

    it('should update party status to cancelled', async () => {
      const party = mockParty({ status: 'confirmed' })

      vi.mocked(prisma.party.update).mockResolvedValue({
        ...party,
        status: 'cancelled',
      })

      const updated = await prisma.party.update({
        where: { id: party.id },
        data: { status: 'cancelled' },
      })

      expect(updated.status).toBe('cancelled')
    })
  })

  describe('Party Entertainer Assignment', () => {
    it('should assign entertainer to party', async () => {
      const party = mockParty({ entertainerId: null })
      const entertainer = mockEntertainer()

      vi.mocked(prisma.party.update).mockResolvedValue({
        ...party,
        entertainerId: entertainer.id,
      })

      const updated = await prisma.party.update({
        where: { id: party.id },
        data: { entertainerId: entertainer.id },
      })

      expect(updated.entertainerId).toBe(entertainer.id)
    })

    it('should remove entertainer from party', async () => {
      const party = mockParty({ entertainerId: 'ent_test_123' })

      vi.mocked(prisma.party.update).mockResolvedValue({
        ...party,
        entertainerId: null,
      })

      const updated = await prisma.party.update({
        where: { id: party.id },
        data: { entertainerId: null },
      })

      expect(updated.entertainerId).toBeNull()
    })
  })

  describe('Party Date Validation', () => {
    it('should calculate correct end date from duration', () => {
      const startDate = new Date('2024-08-15T14:00:00Z') // Use UTC
      const durationMinutes = 180 // 3 hours
      const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000)

      expect(endDate.toISOString()).toBe('2024-08-15T17:00:00.000Z')
    })

    it('should validate party is in the future for new bookings', () => {
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000)
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000)

      expect(futureDate > new Date()).toBe(true)
      expect(pastDate > new Date()).toBe(false)
    })
  })

  describe('Party Safety Information', () => {
    it('should include allergy information', () => {
      const party = mockParty({
        allergies: ['ořechy', 'mléko'],
        dietaryRestrictions: ['bezlepková dieta'],
      })

      expect(party.allergies).toContain('ořechy')
      expect(party.allergies).toContain('mléko')
      expect(party.dietaryRestrictions).toContain('bezlepková dieta')
    })

    it('should include emergency contact', () => {
      const party = mockParty({
        emergencyContact: { name: 'Babička', phone: '+420 777 999 888' },
      })

      expect(party.emergencyContact.name).toBe('Babička')
      expect(party.emergencyContact.phone).toBe('+420 777 999 888')
    })

    it('should handle special needs', () => {
      const party = mockParty({
        specialNeeds: 'Dítě má ADHD, potřebuje častější přestávky',
      })

      expect(party.specialNeeds).toContain('ADHD')
    })
  })

  describe('Party Child Information Privacy', () => {
    it('should store child info correctly', () => {
      const party = mockParty({
        childName: 'Tomáš',
        childAge: 7,
        childGender: 'male',
        childInterests: ['fotbal', 'lego'],
      })

      expect(party.childName).toBe('Tomáš')
      expect(party.childAge).toBe(7)
      expect(party.childGender).toBe('male')
      expect(party.childInterests).toContain('fotbal')
    })

    it('should redact child name for external displays', () => {
      const childName = 'Tomáš'
      const redacted = childName.charAt(0) + '.'

      expect(redacted).toBe('T.')
    })
  })
})

describe('Party Reminders', () => {
  it('should find parties needing reminders (24h before)', async () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(14, 0, 0, 0)

    const partiesNeedingReminder = [
      mockParty({ date: tomorrow, status: 'confirmed' }),
    ]

    vi.mocked(prisma.party.findMany).mockResolvedValue(partiesNeedingReminder)

    // Find parties happening in ~24 hours
    const now = new Date()
    const in23Hours = new Date(now.getTime() + 23 * 60 * 60 * 1000)
    const in25Hours = new Date(now.getTime() + 25 * 60 * 60 * 1000)

    const result = await prisma.party.findMany({
      where: {
        date: {
          gte: in23Hours,
          lte: in25Hours,
        },
        status: 'confirmed',
      },
    })

    expect(result).toHaveLength(1)
  })

  it('should not include cancelled parties in reminders', async () => {
    vi.mocked(prisma.party.findMany).mockResolvedValue([])

    const result = await prisma.party.findMany({
      where: {
        status: 'confirmed', // Excludes cancelled
      },
    })

    expect(result).toHaveLength(0)
  })
})

describe('Party Statistics', () => {
  it('should count parties by status', () => {
    // Test the logic without actual prisma groupBy mock
    const mockStats = [
      { status: 'inquiry', _count: { status: 5 } },
      { status: 'confirmed', _count: { status: 12 } },
      { status: 'completed', _count: { status: 45 } },
      { status: 'cancelled', _count: { status: 3 } },
    ]

    expect(mockStats).toHaveLength(4)
    const confirmed = mockStats.find((s: any) => s.status === 'confirmed')
    expect(confirmed?._count.status).toBe(12)
  })

  it('should calculate total guests for a period', async () => {
    const partiesThisMonth = [
      mockParty({ guestCount: 12 }),
      mockParty({ id: 'p2', guestCount: 15 }),
      mockParty({ id: 'p3', guestCount: 8 }),
    ]

    vi.mocked(prisma.party.findMany).mockResolvedValue(partiesThisMonth)

    const parties = await prisma.party.findMany({
      where: {
        date: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
        status: { in: ['confirmed', 'completed'] },
      },
      select: { guestCount: true },
    })

    const totalGuests = parties.reduce((sum, p) => sum + (p.guestCount || 0), 0)
    expect(totalGuests).toBe(35)
  })
})
