/**
 * Vitest Test Setup
 * Global test configuration and mocks
 */

import { vi, beforeAll, afterAll, afterEach } from 'vitest'

// Mock environment variables
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test'
process.env.NEXTAUTH_SECRET = 'test-secret-key-for-testing'
process.env.NEXTAUTH_URL = 'http://localhost:3002'
process.env.STRIPE_SECRET_KEY = 'sk_test_mock_key'
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_mock_secret'
process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_mock_key'
process.env.RESEND_API_KEY = 're_test_mock_key'
process.env.OPENAI_API_KEY = 'sk-test-mock-key'

// Mock Prisma client
vi.mock('@/lib/prisma', () => ({
  prisma: {
    customer: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    order: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    party: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    package: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    activity: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    invoice: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    safetyChecklist: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    entertainer: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    extra: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    adminUser: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    orderItem: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    $transaction: vi.fn((callback) => callback({
      customer: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      order: {
        create: vi.fn(),
      },
      party: {
        create: vi.fn(),
      },
      safetyChecklist: {
        create: vi.fn(),
      },
    })),
  },
}))

// Mock email service
vi.mock('@/lib/email', () => ({
  sendBookingConfirmationEmail: vi.fn().mockResolvedValue({ success: true }),
  sendPaymentReceiptEmail: vi.fn().mockResolvedValue({ success: true }),
  sendPartyReminderEmail: vi.fn().mockResolvedValue({ success: true }),
  sendEmail: vi.fn().mockResolvedValue({ success: true }),
}))

// Mock Stripe
vi.mock('@/lib/stripe', () => ({
  createBookingDepositCheckout: vi.fn().mockResolvedValue({
    sessionId: 'cs_test_mock_session',
    url: 'https://checkout.stripe.com/test',
  }),
  createBookingFullPaymentCheckout: vi.fn().mockResolvedValue({
    sessionId: 'cs_test_mock_session',
    url: 'https://checkout.stripe.com/test',
  }),
  getStripeClient: vi.fn().mockReturnValue({
    checkout: {
      sessions: {
        create: vi.fn(),
        retrieve: vi.fn(),
      },
    },
    webhooks: {
      constructEvent: vi.fn(),
    },
  }),
}))

// Mock NextAuth
vi.mock('next-auth', () => ({
  getServerSession: vi.fn().mockResolvedValue({
    user: {
      id: 'test-user-id',
      email: 'admin@partypal.cz',
      name: 'Test Admin',
    },
  }),
}))

vi.mock('@/lib/auth', () => ({
  authOptions: {
    providers: [],
    callbacks: {},
  },
}))

// Reset all mocks after each test
afterEach(() => {
  vi.clearAllMocks()
})

// Global test utilities
export const mockDate = (date: Date | string) => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(date))
}

export const restoreDate = () => {
  vi.useRealTimers()
}

// Helper to create mock request
export function createMockRequest(
  method: string,
  body?: object,
  headers?: Record<string, string>
): Request {
  return new Request('http://localhost:3002', {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  })
}

// Helper to create mock NextRequest
export function createMockNextRequest(
  url: string,
  options: {
    method?: string
    body?: object
    headers?: Record<string, string>
  } = {}
) {
  const { method = 'GET', body, headers = {} } = options
  return new Request(`http://localhost:3002${url}`, {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  })
}
