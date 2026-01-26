/**
 * Global test setup for fitness app
 */
import { beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest'

// Mock environment variables
process.env.NODE_ENV = 'test'
process.env.NEXTAUTH_URL = 'http://localhost:3006'
process.env.NEXTAUTH_SECRET = 'test-secret-key-for-testing-only'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db'

// Mock OpenAI API Key (will be mocked anyway, but prevents warnings)
delete process.env.OPENAI_API_KEY

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
  tenantId: 'test-tenant-123',
  userId: 'test-user-123',
  ...overrides,
})

export const createMockSession = (overrides = {}) => ({
  user: {
    id: 'test-user-123',
    email: 'test@example.com',
    name: 'Test User',
    role: 'admin',
    tenantId: 'test-tenant-123',
    ...overrides,
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
})

export const waitFor = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
