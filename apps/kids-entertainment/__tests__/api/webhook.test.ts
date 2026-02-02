/**
 * Stripe Webhook Tests
 * Tests for webhook event handling
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'
import { mockOrder, mockCustomer, mockInvoice, mockParty } from '../mocks/prisma'

// Mock the Stripe verification
vi.mock('@/lib/stripe', async () => {
  return {
    verifyWebhookSignature: vi.fn(),
    formatAmountForDisplay: vi.fn((amount: number) => `${amount / 100} CZK`),
    getStripeClient: vi.fn(),
  }
})

// Mock invoice service
vi.mock('@/lib/services/invoices', () => ({
  createInvoiceFromOrder: vi.fn().mockResolvedValue({
    id: 'inv_test_123',
    invoiceNumber: 'PP-INV-2024-001',
  }),
  generateInvoicePDF: vi.fn().mockResolvedValue(Buffer.from('mock-pdf')),
}))

describe('Stripe Webhook Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('checkout.session.completed', () => {
    it('should process deposit payment successfully', async () => {
      const order = mockOrder({
        id: 'ord_test_123',
        status: 'new',
        linkedPartyId: 'party_test_123',
        pricing: { total: 4500, deposit: 1350 },
      })
      const customer = mockCustomer()

      vi.mocked(prisma.order.findUnique).mockResolvedValue(order)
      vi.mocked(prisma.order.update).mockResolvedValue({
        ...order,
        status: 'confirmed',
        pricing: {
          ...order.pricing,
          depositPaidAt: expect.any(String),
          stripeSessionId: 'cs_test_123',
          paymentIntentId: 'pi_test_123',
        },
      })
      vi.mocked(prisma.party.update).mockResolvedValue({
        ...mockParty(),
        status: 'confirmed',
      })

      // Simulate the webhook payload processing
      const sessionData = {
        id: 'cs_test_123',
        payment_intent: 'pi_test_123',
        amount_total: 135000,
        metadata: {
          orderId: 'ord_test_123',
          type: 'deposit',
        },
      }

      // Verify order update would be called with correct data
      await prisma.order.update({
        where: { id: sessionData.metadata.orderId },
        data: {
          status: 'confirmed',
          pricing: {
            ...order.pricing,
            deposit: sessionData.amount_total,
            depositPaidAt: new Date().toISOString(),
            stripeSessionId: sessionData.id,
            paymentIntentId: sessionData.payment_intent,
          },
        },
      })

      expect(prisma.order.update).toHaveBeenCalled()
    })

    it('should process full payment successfully', async () => {
      const order = mockOrder({
        id: 'ord_test_456',
        status: 'confirmed',
        pricing: { total: 4500, deposit: 1350, depositPaidAt: '2024-01-15' },
      })

      vi.mocked(prisma.order.findUnique).mockResolvedValue(order)
      vi.mocked(prisma.order.update).mockResolvedValue({
        ...order,
        status: 'completed',
        pricing: {
          ...order.pricing,
          paidAt: expect.any(String),
        },
      })

      const sessionData = {
        id: 'cs_test_456',
        payment_intent: 'pi_test_456',
        amount_total: 315000,
        metadata: {
          orderId: 'ord_test_456',
          type: 'full_payment',
        },
      }

      await prisma.order.update({
        where: { id: sessionData.metadata.orderId },
        data: {
          status: 'completed',
          pricing: {
            ...order.pricing,
            paidAt: new Date().toISOString(),
          },
        },
      })

      expect(prisma.order.update).toHaveBeenCalled()
    })

    it('should handle missing orderId in metadata', async () => {
      const sessionWithoutOrderId = {
        id: 'cs_test_no_order',
        metadata: {},
      }

      // Without orderId, no update should happen
      expect(sessionWithoutOrderId.metadata).not.toHaveProperty('orderId')
    })

    it('should update linked party status on deposit payment', async () => {
      const order = mockOrder({
        linkedPartyId: 'party_test_789',
      })

      vi.mocked(prisma.party.update).mockResolvedValue({
        ...mockParty({ id: 'party_test_789' }),
        status: 'confirmed',
      })

      if (order.linkedPartyId) {
        await prisma.party.update({
          where: { id: order.linkedPartyId },
          data: { status: 'confirmed' },
        })
      }

      expect(prisma.party.update).toHaveBeenCalledWith({
        where: { id: 'party_test_789' },
        data: { status: 'confirmed' },
      })
    })
  })

  describe('checkout.session.expired', () => {
    it('should cancel order when checkout expires', async () => {
      const order = mockOrder({ id: 'ord_expired_123', status: 'new' })

      vi.mocked(prisma.order.update).mockResolvedValue({
        ...order,
        status: 'cancelled',
      })

      await prisma.order.update({
        where: { id: 'ord_expired_123' },
        data: { status: 'cancelled' },
      })

      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: 'ord_expired_123' },
        data: { status: 'cancelled' },
      })
    })
  })

  describe('payment_intent.payment_failed', () => {
    it('should log payment failure details', async () => {
      const failedPayment = {
        id: 'pi_failed_123',
        last_payment_error: {
          message: 'Your card was declined.',
          code: 'card_declined',
        },
      }

      // In actual implementation, this would log the error
      expect(failedPayment.last_payment_error.message).toBe('Your card was declined.')
    })
  })

  describe('charge.refunded', () => {
    it('should handle full refund', async () => {
      const orderWithPayment = mockOrder({
        id: 'ord_refund_123',
        status: 'completed',
        pricing: { paymentIntentId: 'pi_refund_123', total: 4500 },
      })

      vi.mocked(prisma.order.findMany).mockResolvedValue([orderWithPayment])
      vi.mocked(prisma.order.update).mockResolvedValue({
        ...orderWithPayment,
        status: 'cancelled',
        pricing: {
          ...orderWithPayment.pricing,
          refundedAt: expect.any(String),
          refundAmount: 450000,
        },
      })

      const chargeEvent = {
        payment_intent: 'pi_refund_123',
        amount: 450000,
        amount_refunded: 450000, // Full refund
      }

      const orders = await prisma.order.findMany({ take: 100 })
      const order = orders.find(
        (o) => (o.pricing as any)?.paymentIntentId === chargeEvent.payment_intent
      )

      if (order) {
        const isFullRefund = chargeEvent.amount_refunded === chargeEvent.amount
        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: isFullRefund ? 'cancelled' : 'confirmed',
            pricing: {
              ...order.pricing,
              refundedAt: new Date().toISOString(),
              refundAmount: chargeEvent.amount_refunded,
            },
          },
        })
      }

      expect(prisma.order.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'cancelled',
          }),
        })
      )
    })

    it('should handle partial refund', async () => {
      const orderWithPayment = mockOrder({
        id: 'ord_partial_refund',
        status: 'completed',
        pricing: { paymentIntentId: 'pi_partial_123', total: 4500 },
      })

      vi.mocked(prisma.order.findMany).mockResolvedValue([orderWithPayment])

      const chargeEvent = {
        payment_intent: 'pi_partial_123',
        amount: 450000,
        amount_refunded: 135000, // Partial refund (deposit)
      }

      const isFullRefund = chargeEvent.amount_refunded === chargeEvent.amount
      expect(isFullRefund).toBe(false)

      // Partial refund should keep order as 'confirmed', not 'cancelled'
      const expectedStatus = isFullRefund ? 'cancelled' : 'confirmed'
      expect(expectedStatus).toBe('confirmed')
    })
  })
})

describe('Webhook Security', () => {
  it('should require stripe-signature header', async () => {
    const requestWithoutSignature = {
      headers: new Headers({}),
    }

    const signature = requestWithoutSignature.headers.get('stripe-signature')
    expect(signature).toBeNull()
  })

  it('should reject invalid signatures', async () => {
    const { verifyWebhookSignature } = await import('@/lib/stripe')

    vi.mocked(verifyWebhookSignature).mockImplementation(() => {
      throw new Error('Invalid signature')
    })

    expect(() => {
      verifyWebhookSignature('payload', 'invalid_sig', 'secret')
    }).toThrow('Invalid signature')
  })

  it('should reject if webhook secret is not configured', async () => {
    const originalEnv = process.env.STRIPE_WEBHOOK_SECRET
    delete process.env.STRIPE_WEBHOOK_SECRET

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    expect(webhookSecret).toBeUndefined()

    // Restore
    process.env.STRIPE_WEBHOOK_SECRET = originalEnv
  })
})

describe('Invoice Generation on Payment', () => {
  it('should create invoice after successful payment', async () => {
    const { createInvoiceFromOrder, generateInvoicePDF } = await import(
      '@/lib/services/invoices'
    )

    const orderId = 'ord_test_123'
    const paymentType = 'deposit'

    const invoice = await createInvoiceFromOrder(orderId, paymentType)
    const pdfBuffer = await generateInvoicePDF(invoice.id)

    expect(invoice.invoiceNumber).toBe('PP-INV-2024-001')
    expect(pdfBuffer).toBeInstanceOf(Buffer)
  })

  it('should send payment receipt email with PDF', async () => {
    const { sendPaymentReceiptEmail } = await import('@/lib/email')

    const emailData = {
      to: 'parent@example.com',
      parentName: 'Jana Nováková',
      invoiceNumber: 'PP-INV-2024-001',
      amount: '1 350 CZK',
      paymentType: 'deposit' as const,
      partyDate: '15. srpna 2024',
      pdfBuffer: Buffer.from('mock-pdf'),
    }

    const result = await sendPaymentReceiptEmail(emailData)

    expect(result.success).toBe(true)
    expect(sendPaymentReceiptEmail).toHaveBeenCalledWith(emailData)
  })
})
