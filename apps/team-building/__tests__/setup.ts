/**
 * Global test setup for TeamForge (team-building) app
 */
import { beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest'

// Mock environment variables using vi.stubEnv for proper Vitest compatibility
vi.stubEnv('NODE_ENV', 'test')
vi.stubEnv('NEXTAUTH_URL', 'http://localhost:3009')
vi.stubEnv('NEXTAUTH_SECRET', 'test-secret-key-for-testing-only')
vi.stubEnv('DATABASE_URL', 'postgresql://test:test@localhost:5432/test_db')

// Set empty string for optional API keys to prevent warnings
vi.stubEnv('RESEND_API_KEY', '')
vi.stubEnv('OPENAI_API_KEY', '')

// Global mocks
beforeAll(() => {
  // Setup console mocks to reduce noise
  vi.spyOn(console, 'log').mockImplementation(() => {})
  vi.spyOn(console, 'warn').mockImplementation(() => {})
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterAll(() => {
  vi.restoreAllMocks()
})

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  vi.clearAllTimers()
})

// Global test utilities
export const createMockContext = (overrides = {}) => ({
  userId: 'test-user-123',
  ...overrides,
})

export const createMockSession = (overrides = {}) => ({
  user: {
    id: 'test-user-123',
    email: 'admin@teamforge.test',
    name: 'Test Admin',
    role: 'admin',
    ...overrides,
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
})

export const createMockProgram = (overrides = {}) => ({
  id: 'program-123',
  title: 'Test Program',
  slug: 'test-program',
  status: 'active',
  description: 'A test program for team building',
  price: 50000,
  duration: 240,
  minParticipants: 10,
  maxParticipants: 30,
  ...overrides,
})

export const createMockActivity = (overrides = {}) => ({
  id: 'activity-123',
  title: 'Test Activity',
  slug: 'test-activity',
  status: 'active',
  category: 'problem_solving',
  duration: 60,
  minParticipants: 5,
  maxParticipants: 20,
  ...overrides,
})

export const createMockCustomer = (overrides = {}) => ({
  id: 'customer-123',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '+420123456789',
  organization: 'Test Company s.r.o.',
  ...overrides,
})

export const createMockSession2 = (overrides = {}) => ({
  id: 'session-123',
  status: 'confirmed',
  date: new Date('2025-03-15'),
  teamSize: 20,
  companyName: 'Test Company',
  programId: 'program-123',
  ...overrides,
})

export const createMockOrder = (overrides = {}) => ({
  id: 'order-123',
  orderNumber: 'ORD-2025-001',
  status: 'new',
  sessionName: 'Team Building Q1',
  teamSize: 25,
  customerId: 'customer-123',
  ...overrides,
})

export const createMockInvoice = (overrides = {}) => ({
  id: 'invoice-123',
  invoiceNumber: 'INV-2025-001',
  status: 'draft',
  issueDate: new Date('2025-01-15'),
  dueDate: new Date('2025-01-29'),
  subtotal: 50000,
  vatRate: 21,
  vatAmount: 10500,
  totalAmount: 60500,
  paidAmount: 0,
  currency: 'CZK',
  customerId: 'customer-123',
  ...overrides,
})

export const waitFor = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
