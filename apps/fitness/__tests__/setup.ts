/**
 * Global test setup for fitness app
 */
import { beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest'

// Mock environment variables using vi.stubEnv for proper Vitest compatibility
// This avoids Object.defineProperty issues with process.env
vi.stubEnv('NODE_ENV', 'test')
vi.stubEnv('NEXTAUTH_URL', 'http://localhost:3006')
vi.stubEnv('NEXTAUTH_SECRET', 'test-secret-key-for-testing-only')
vi.stubEnv('DATABASE_URL', 'postgresql://test:test@localhost:5432/test_db')

// Set empty string for OPENAI_API_KEY to prevent warnings (will be mocked anyway)
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
