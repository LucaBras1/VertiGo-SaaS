/**
 * Prisma Client Mock for Testing
 *
 * Provides mock implementations of Prisma client methods
 */
import { vi } from 'vitest'
import { mockDeep, mockReset, DeepMockProxy } from 'vitest-mock-extended'
import { PrismaClient } from '@prisma/client'

// Create deep mock of PrismaClient
export const prismaMock = mockDeep<PrismaClient>() as DeepMockProxy<PrismaClient>

// Reset mocks before each test
export const resetPrismaMock = () => {
  mockReset(prismaMock)
}

// Mock data factories
export const mockClient = (overrides = {}) => ({
  id: 'client-123',
  tenantId: 'tenant-123',
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+420123456789',
  dateOfBirth: new Date('1990-01-01'),
  gender: 'male',
  goals: ['weight_loss', 'muscle_gain'],
  currentWeight: 85,
  targetWeight: 75,
  height: 180,
  fitnessLevel: 'intermediate',
  injuryHistory: null,
  dietaryNotes: null,
  medicalNotes: null,
  membershipType: 'premium',
  creditsRemaining: 10,
  membershipExpiry: new Date('2025-12-31'),
  notes: null,
  tags: [],
  status: 'active',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

export const mockSession = (overrides = {}) => ({
  id: 'session-123',
  tenantId: 'tenant-123',
  clientId: 'client-123',
  scheduledAt: new Date('2025-02-01T10:00:00Z'),
  duration: 60,
  muscleGroups: ['chest', 'triceps'],
  price: 500,
  status: 'scheduled',
  trainerNotes: 'Focus on form',
  clientFeedback: null,
  rating: null,
  exercises: [],
  workoutPlan: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

export const mockTenant = (overrides = {}) => ({
  id: 'tenant-123',
  vertical: 'FITNESS',
  name: 'Test Fitness Studio',
  slug: 'test-fitness',
  subscriptionTier: 'pro',
  subscriptionStatus: 'active',
  aiCredits: 1000,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

export const mockUser = (overrides = {}) => ({
  id: 'user-123',
  tenantId: 'tenant-123',
  name: 'Test Trainer',
  email: 'trainer@example.com',
  password: 'hashed-password',
  role: 'admin',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

export const mockMeasurement = (overrides = {}) => ({
  id: 'measurement-123',
  clientId: 'client-123',
  date: new Date(),
  weight: 85,
  bodyFat: 18.5,
  muscleMass: 68,
  measurements: {
    chest: 100,
    waist: 85,
    hips: 95,
    arms: 35,
    legs: 60,
  },
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

// Helper to setup common mock responses
export const setupPrismaMocks = () => {
  // Default successful responses
  prismaMock.client.findFirst.mockResolvedValue(mockClient())
  prismaMock.client.findUnique.mockResolvedValue(mockClient())
  prismaMock.client.findMany.mockResolvedValue([mockClient()])
  prismaMock.client.count.mockResolvedValue(1)
  prismaMock.client.create.mockResolvedValue(mockClient())
  prismaMock.client.update.mockResolvedValue(mockClient())
  prismaMock.client.delete.mockResolvedValue(mockClient())

  prismaMock.session.findFirst.mockResolvedValue(mockSession())
  prismaMock.session.findUnique.mockResolvedValue(mockSession())
  prismaMock.session.findMany.mockResolvedValue([mockSession()])
  prismaMock.session.count.mockResolvedValue(1)
  prismaMock.session.create.mockResolvedValue(mockSession())
  prismaMock.session.update.mockResolvedValue(mockSession())
  prismaMock.session.delete.mockResolvedValue(mockSession())

  prismaMock.tenant.findUnique.mockResolvedValue(mockTenant())
  prismaMock.tenant.findFirst.mockResolvedValue(mockTenant())

  prismaMock.user.findUnique.mockResolvedValue(mockUser())
  prismaMock.user.findFirst.mockResolvedValue(mockUser())
  prismaMock.user.create.mockResolvedValue(mockUser())

  prismaMock.$transaction.mockImplementation((callback: any) => {
    if (typeof callback === 'function') {
      return callback(prismaMock)
    }
    return Promise.resolve(callback)
  })
}

// Mock the actual prisma module
vi.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}))

vi.mock('@/lib/prisma-client', () => ({
  prisma: prismaMock,
}))
