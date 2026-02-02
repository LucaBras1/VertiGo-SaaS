/**
 * Bookings API Tests
 * Tests for POST /api/bookings - critical booking flow
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/bookings/route'
import { prisma } from '@/lib/prisma'
import { sendBookingConfirmationEmail } from '@/lib/email'
import {
  mockCustomer,
  mockPackage,
  mockParty,
  mockOrder,
} from '../mocks/prisma'

describe('POST /api/bookings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const validBookingData = {
    packageId: 'pkg_test_123',
    activityIds: [],
    partyDetails: {
      date: '2024-08-15',
      startTime: '14:00',
      venue: 'Kavárna U Kocoura, Praha 2',
      guestCount: 12,
      specialRequests: 'Bezlepkový dort',
    },
    childInfo: {
      name: 'Tomáš',
      age: 7,
      gender: 'male',
      interests: 'fotbal, lego',
      allergies: ['ořechy'],
      dietaryRestrictions: ['bezlepková dieta'],
      specialNeeds: null,
    },
    contact: {
      parentName: 'Jana Nováková',
      parentEmail: 'parent@example.com',
      parentPhone: '+420 777 123 456',
      emergencyContact: { name: 'Babička', phone: '+420 777 999 888' },
    },
    safetyAcknowledged: true,
  }

  it('should create a booking successfully with new customer', async () => {
    // Setup mocks
    const mockPkg = mockPackage()
    const mockCreatedCustomer = mockCustomer()
    const mockCreatedParty = mockParty()
    const mockCreatedOrder = mockOrder()

    vi.mocked(prisma.customer.findUnique).mockResolvedValue(null) // New customer
    vi.mocked(prisma.customer.create).mockResolvedValue(mockCreatedCustomer)
    vi.mocked(prisma.package.findUnique).mockResolvedValue(mockPkg)
    vi.mocked(prisma.party.create).mockResolvedValue(mockCreatedParty)
    vi.mocked(prisma.order.create).mockResolvedValue({
      ...mockCreatedOrder,
      items: [],
    })
    vi.mocked(prisma.safetyChecklist.create).mockResolvedValue({} as any)
    vi.mocked(prisma.customer.update).mockResolvedValue(mockCreatedCustomer)

    const request = new NextRequest('http://localhost:3002/api/bookings', {
      method: 'POST',
      body: JSON.stringify(validBookingData),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.success).toBe(true)
    expect(data.orderId).toBeDefined()
    expect(data.orderNumber).toBeDefined()
    expect(data.partyId).toBeDefined()

    // Verify customer was created
    expect(prisma.customer.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        email: 'parent@example.com',
        firstName: 'Jana',
        lastName: 'Nováková',
      }),
    })

    // Verify email was sent
    expect(sendBookingConfirmationEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'parent@example.com',
        parentName: 'Jana Nováková',
        childName: 'Tomáš',
      })
    )
  })

  it('should create a booking with existing customer', async () => {
    const existingCustomer = mockCustomer()
    const mockPkg = mockPackage()
    const mockCreatedParty = mockParty()
    const mockCreatedOrder = mockOrder()

    vi.mocked(prisma.customer.findUnique).mockResolvedValue(existingCustomer)
    vi.mocked(prisma.package.findUnique).mockResolvedValue(mockPkg)
    vi.mocked(prisma.party.create).mockResolvedValue(mockCreatedParty)
    vi.mocked(prisma.order.create).mockResolvedValue({
      ...mockCreatedOrder,
      items: [],
    })
    vi.mocked(prisma.safetyChecklist.create).mockResolvedValue({} as any)
    vi.mocked(prisma.customer.update).mockResolvedValue(existingCustomer)

    const request = new NextRequest('http://localhost:3002/api/bookings', {
      method: 'POST',
      body: JSON.stringify(validBookingData),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.success).toBe(true)

    // Customer should NOT be created
    expect(prisma.customer.create).not.toHaveBeenCalled()

    // Customer stats should be updated
    expect(prisma.customer.update).toHaveBeenCalledWith({
      where: { id: existingCustomer.id },
      data: expect.objectContaining({
        totalPartiesBooked: { increment: 1 },
      }),
    })
  })

  it('should return 400 when missing required fields', async () => {
    const incompleteData = {
      packageId: 'pkg_test_123',
      // Missing partyDetails, childInfo, contact
    }

    const request = new NextRequest('http://localhost:3002/api/bookings', {
      method: 'POST',
      body: JSON.stringify(incompleteData),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Missing required fields')
  })

  it('should return 400 when no package or activities selected', async () => {
    const dataWithoutPackage = {
      ...validBookingData,
      packageId: null,
      activityIds: [],
    }

    const request = new NextRequest('http://localhost:3002/api/bookings', {
      method: 'POST',
      body: JSON.stringify(dataWithoutPackage),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Select a package or at least one activity')
  })

  it('should create booking with custom activities instead of package', async () => {
    const customBookingData = {
      ...validBookingData,
      packageId: null,
      activityIds: ['act_1', 'act_2'],
    }

    const mockActivities = [
      { id: 'act_1', duration: 30, price: 500 },
      { id: 'act_2', duration: 45, price: 750 },
    ]

    vi.mocked(prisma.customer.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.customer.create).mockResolvedValue(mockCustomer())
    vi.mocked(prisma.activity.findMany).mockResolvedValue(mockActivities as any)
    vi.mocked(prisma.party.create).mockResolvedValue(mockParty({ packageId: null }))
    vi.mocked(prisma.order.create).mockResolvedValue({
      ...mockOrder(),
      items: [],
    })
    vi.mocked(prisma.safetyChecklist.create).mockResolvedValue({} as any)
    vi.mocked(prisma.customer.update).mockResolvedValue(mockCustomer())

    const request = new NextRequest('http://localhost:3002/api/bookings', {
      method: 'POST',
      body: JSON.stringify(customBookingData),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.success).toBe(true)

    // Should fetch activities for pricing
    expect(prisma.activity.findMany).toHaveBeenCalledWith({
      where: { id: { in: ['act_1', 'act_2'] } },
      select: { duration: true },
    })
  })

  it('should continue even if confirmation email fails', async () => {
    const mockPkg = mockPackage()
    const mockCreatedParty = mockParty()
    const mockCreatedOrder = mockOrder()

    vi.mocked(prisma.customer.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.customer.create).mockResolvedValue(mockCustomer())
    vi.mocked(prisma.package.findUnique).mockResolvedValue(mockPkg)
    vi.mocked(prisma.party.create).mockResolvedValue(mockCreatedParty)
    vi.mocked(prisma.order.create).mockResolvedValue({
      ...mockCreatedOrder,
      items: [],
    })
    vi.mocked(prisma.safetyChecklist.create).mockResolvedValue({} as any)
    vi.mocked(prisma.customer.update).mockResolvedValue(mockCustomer())

    // Email fails
    vi.mocked(sendBookingConfirmationEmail).mockRejectedValue(
      new Error('Email service down')
    )

    const request = new NextRequest('http://localhost:3002/api/bookings', {
      method: 'POST',
      body: JSON.stringify(validBookingData),
    })

    const response = await POST(request)
    const data = await response.json()

    // Booking should still succeed
    expect(response.status).toBe(201)
    expect(data.success).toBe(true)
  })

  it('should generate unique order number', async () => {
    const mockPkg = mockPackage()
    const mockCreatedParty = mockParty()

    vi.mocked(prisma.customer.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.customer.create).mockResolvedValue(mockCustomer())
    vi.mocked(prisma.package.findUnique).mockResolvedValue(mockPkg)
    vi.mocked(prisma.party.create).mockResolvedValue(mockCreatedParty)
    vi.mocked(prisma.order.create).mockImplementation(async ({ data }) => {
      // Verify order number format: PP{YY}{MM}-{RANDOM}
      const orderNumber = data.orderNumber as string
      expect(orderNumber).toMatch(/^PP\d{4}-[A-Z0-9]{6}$/)
      return {
        ...mockOrder(),
        orderNumber,
        items: [],
      }
    })
    vi.mocked(prisma.safetyChecklist.create).mockResolvedValue({} as any)
    vi.mocked(prisma.customer.update).mockResolvedValue(mockCustomer())

    const request = new NextRequest('http://localhost:3002/api/bookings', {
      method: 'POST',
      body: JSON.stringify(validBookingData),
    })

    await POST(request)
  })
})
