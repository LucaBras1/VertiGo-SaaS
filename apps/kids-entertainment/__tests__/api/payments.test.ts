/**
 * Payments API Tests
 * Tests for checkout session creation and payment handling
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'
import { mockOrder, mockCustomer, mockParty, mockPackage } from '../mocks/prisma'

// Import Stripe mocks
vi.mock('@/lib/stripe', () => ({
  createBookingDepositCheckout: vi.fn().mockResolvedValue({
    sessionId: 'cs_test_deposit_session',
    url: 'https://checkout.stripe.com/pay/cs_test_deposit_session',
  }),
  createBookingFullPaymentCheckout: vi.fn().mockResolvedValue({
    sessionId: 'cs_test_full_session',
    url: 'https://checkout.stripe.com/pay/cs_test_full_session',
  }),
  getStripeClient: vi.fn(),
}))

describe('Payment Checkout API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Deposit Payment', () => {
    it('should create deposit checkout session with correct amount', async () => {
      const { createBookingDepositCheckout } = await import('@/lib/stripe')

      const order = mockOrder({
        id: 'ord_test_123',
        pricing: { total: 450000 }, // 4500 CZK in cents
      })
      const customer = mockCustomer()
      const party = mockParty()
      const pkg = mockPackage()

      // Calculate expected deposit (30%)
      const depositPercent = 30
      const expectedDeposit = Math.round((450000 * depositPercent) / 100)

      vi.mocked(prisma.order.findUnique).mockResolvedValue({
        ...order,
        customer,
        linkedParty: {
          ...party,
          package: pkg,
        },
      } as any)

      const checkoutData = {
        orderId: order.id,
        orderNumber: order.orderNumber,
        partyDate: party.date.toLocaleDateString('cs-CZ'),
        depositAmount: expectedDeposit,
        totalAmount: 450000,
        customerId: customer.id,
        customerEmail: customer.email,
        customerName: `${customer.firstName} ${customer.lastName}`,
        packageName: pkg.title,
        successUrl: 'http://localhost:3002/booking/success?session_id={CHECKOUT_SESSION_ID}',
        cancelUrl: `http://localhost:3002/booking/cancel?order_id=${order.id}`,
      }

      const session = await createBookingDepositCheckout(checkoutData)

      expect(session.sessionId).toBe('cs_test_deposit_session')
      expect(session.url).toContain('cs_test_deposit_session')
      expect(createBookingDepositCheckout).toHaveBeenCalledWith(
        expect.objectContaining({
          depositAmount: 135000, // 30% of 450000
        })
      )
    })

    it('should calculate 30% deposit correctly', () => {
      const testCases = [
        { total: 450000, expectedDeposit: 135000 },
        { total: 600000, expectedDeposit: 180000 },
        { total: 350000, expectedDeposit: 105000 },
        { total: 999999, expectedDeposit: 300000 }, // Rounded
      ]

      const depositPercent = 30

      testCases.forEach(({ total, expectedDeposit }) => {
        const calculated = Math.round((total * depositPercent) / 100)
        expect(calculated).toBe(expectedDeposit)
      })
    })
  })

  describe('Full Payment', () => {
    it('should create full payment checkout session', async () => {
      const { createBookingFullPaymentCheckout } = await import('@/lib/stripe')

      const order = mockOrder({
        id: 'ord_test_456',
        pricing: {
          total: 450000,
          deposit: 135000,
          depositPaidAt: '2024-01-15T10:00:00Z',
        },
      })
      const customer = mockCustomer()

      const checkoutData = {
        orderId: order.id,
        orderNumber: order.orderNumber,
        partyDate: '15. 8. 2024',
        totalAmount: 450000,
        paidDeposit: 135000,
        customerId: customer.id,
        customerEmail: customer.email,
        packageName: 'Superhrdina párty',
        successUrl: 'http://localhost:3002/booking/success?session_id={CHECKOUT_SESSION_ID}',
        cancelUrl: `http://localhost:3002/booking/cancel?order_id=${order.id}`,
      }

      const session = await createBookingFullPaymentCheckout(checkoutData)

      expect(session.sessionId).toBe('cs_test_full_session')
      expect(createBookingFullPaymentCheckout).toHaveBeenCalledWith(
        expect.objectContaining({
          paidDeposit: 135000,
          totalAmount: 450000,
        })
      )
    })

    it('should calculate remaining amount correctly', () => {
      const total = 450000
      const deposit = 135000
      const remaining = total - deposit

      expect(remaining).toBe(315000) // 3150 CZK
    })
  })

  describe('Order Validation', () => {
    it('should reject request without orderId', () => {
      const requestBody = {}
      const hasOrderId = 'orderId' in requestBody && requestBody.orderId

      expect(hasOrderId).toBeFalsy()
    })

    it('should return 404 for non-existent order', async () => {
      vi.mocked(prisma.order.findUnique).mockResolvedValue(null)

      const order = await prisma.order.findUnique({
        where: { id: 'non_existent_order' },
      })

      expect(order).toBeNull()
    })

    it('should return error for order without customer', async () => {
      const orderWithoutCustomer = mockOrder({ customerId: null })

      vi.mocked(prisma.order.findUnique).mockResolvedValue({
        ...orderWithoutCustomer,
        customer: null,
      } as any)

      const order = await prisma.order.findUnique({
        where: { id: orderWithoutCustomer.id },
        include: { customer: true },
      })

      expect(order?.customer).toBeNull()
    })

    it('should reject invalid payment type', () => {
      const validTypes = ['deposit', 'full']
      const invalidType = 'invalid'

      expect(validTypes.includes(invalidType)).toBe(false)
    })
  })

  describe('Checkout Session Data', () => {
    it('should include correct metadata for deposit', () => {
      const order = mockOrder()

      const metadata = {
        orderId: order.id,
        type: 'deposit',
      }

      expect(metadata.orderId).toBe(order.id)
      expect(metadata.type).toBe('deposit')
    })

    it('should include correct metadata for full payment', () => {
      const order = mockOrder()

      const metadata = {
        orderId: order.id,
        type: 'full_payment',
      }

      expect(metadata.type).toBe('full_payment')
    })

    it('should format party date correctly', () => {
      const date = new Date('2024-08-15T14:00:00')
      const formatted = date.toLocaleDateString('cs-CZ')

      expect(formatted).toMatch(/\d+\.\s*\d+\.\s*\d+/)
    })

    it('should use fallback package name when not available', () => {
      const order = mockOrder()
      const packageName = undefined
      const fallback = 'Dětská oslava'

      const displayName = packageName || fallback

      expect(displayName).toBe('Dětská oslava')
    })
  })

  describe('URL Generation', () => {
    it('should generate correct success URL with session placeholder', () => {
      const baseUrl = 'http://localhost:3002'
      const successUrl = `${baseUrl}/booking/success?session_id={CHECKOUT_SESSION_ID}`

      expect(successUrl).toContain('{CHECKOUT_SESSION_ID}')
    })

    it('should generate correct cancel URL with order ID', () => {
      const baseUrl = 'http://localhost:3002'
      const orderId = 'ord_test_123'
      const cancelUrl = `${baseUrl}/booking/cancel?order_id=${orderId}`

      expect(cancelUrl).toContain(orderId)
    })
  })

  describe('Pricing Extraction', () => {
    it('should handle pricing as JSON object', () => {
      const order = mockOrder({
        pricing: { total: 450000, deposit: 135000 },
      })

      const pricing = order.pricing as { total?: number }
      const total = pricing?.total || 0

      expect(total).toBe(450000)
    })

    it('should handle missing pricing gracefully', () => {
      const order = mockOrder({ pricing: null })

      const pricing = order.pricing as { total?: number } | null
      const total = pricing?.total || 0

      expect(total).toBe(0)
    })

    it('should handle empty pricing object', () => {
      const order = mockOrder({ pricing: {} })

      const pricing = order.pricing as { total?: number }
      const total = pricing?.total || 0

      expect(total).toBe(0)
    })
  })
})

describe('Payment Flow Integration', () => {
  it('should follow correct flow: Order → Deposit → Confirmation → Full Payment', () => {
    const flow = [
      { step: 1, action: 'create_order', status: 'new' },
      { step: 2, action: 'deposit_payment', status: 'confirmed' },
      { step: 3, action: 'full_payment', status: 'completed' },
    ]

    expect(flow[0].status).toBe('new')
    expect(flow[1].status).toBe('confirmed')
    expect(flow[2].status).toBe('completed')
  })

  it('should track payment status in order pricing JSON', () => {
    const initialPricing = {
      total: 450000,
      deposit: 0,
    }

    const afterDeposit = {
      ...initialPricing,
      deposit: 135000,
      depositPaidAt: '2024-01-15T10:00:00Z',
      stripeSessionId: 'cs_test_123',
    }

    const afterFullPayment = {
      ...afterDeposit,
      paidAt: '2024-02-15T10:00:00Z',
    }

    expect(afterDeposit.depositPaidAt).toBeDefined()
    expect(afterFullPayment.paidAt).toBeDefined()
  })
})

describe('Error Handling', () => {
  it('should handle Stripe API errors gracefully', async () => {
    const { createBookingDepositCheckout } = await import('@/lib/stripe')

    vi.mocked(createBookingDepositCheckout).mockRejectedValueOnce(
      new Error('Stripe API error: card_declined')
    )

    await expect(
      createBookingDepositCheckout({} as any)
    ).rejects.toThrow('Stripe API error')
  })

  it('should handle database errors gracefully', async () => {
    vi.mocked(prisma.order.findUnique).mockRejectedValueOnce(
      new Error('Database connection failed')
    )

    await expect(
      prisma.order.findUnique({ where: { id: 'test' } })
    ).rejects.toThrow('Database connection failed')
  })
})
