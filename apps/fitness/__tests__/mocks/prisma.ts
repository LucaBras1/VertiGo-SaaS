/**
 * Prisma Client Mock for Testing
 *
 * Provides mock implementations of Prisma client methods
 */
import { vi } from 'vitest'
import { mockDeep, mockReset, DeepMockProxy } from 'vitest-mock-extended'
import { PrismaClient, Vertical } from '../../src/generated/prisma'

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
  avatar: null,
  dateOfBirth: new Date('1990-01-01'),
  gender: 'male',
  goals: ['weight_loss', 'muscle_gain'],
  currentWeight: 85,
  targetWeight: 75,
  height: 180,
  bodyMeasurements: null,
  bodyFatPercent: null,
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
  source: null,
  referredBy: null,
  referralCode: 'REF123',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

// Training session (model Session)
export const mockTrainingSession = (overrides = {}) => ({
  id: 'session-123',
  tenantId: 'tenant-123',
  clientId: 'client-123',
  scheduledAt: new Date('2025-02-01T10:00:00Z'),
  duration: 60,
  status: 'scheduled',
  workoutPlan: null,
  exercisesLogged: [],
  caloriesBurned: null,
  heartRateAvg: null,
  muscleGroups: ['chest', 'triceps'],
  clientFeedback: null,
  trainerNotes: 'Focus on form',
  intensity: null,
  clientRating: null,
  price: 500,
  isPaid: false,
  packageId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

// Auth session (model UserSession)
export const mockUserSession = (overrides = {}) => ({
  id: 'user-session-123',
  userId: 'user-123',
  sessionToken: 'mock-session-token',
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
  ...overrides,
})

// Legacy alias for backward compatibility
export const mockSession = mockTrainingSession

export const mockTenant = (overrides = {}) => ({
  id: 'tenant-123',
  vertical: 'FITNESS' as Vertical,
  name: 'Test Fitness Studio',
  slug: 'test-fitness',
  email: 'test@fitness.com',
  phone: null,
  website: null,
  logo: null,
  currency: 'CZK',
  subscriptionTier: 'pro',
  subscriptionStatus: 'active',
  subscriptionEnds: null,
  stripeCustomerId: null,
  stripeSubscriptionId: null,
  primaryColor: '#3B82F6',
  secondaryColor: '#10B981',
  accentColor: '#F59E0B',
  enableWhiteLabel: false,
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
  emailVerified: null,
  image: null,
  hashedPassword: 'hashed-password',
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
  // Default successful responses for Client model
  prismaMock.client.findFirst.mockResolvedValue(mockClient() as any)
  prismaMock.client.findUnique.mockResolvedValue(mockClient() as any)
  prismaMock.client.findMany.mockResolvedValue([mockClient()] as any)
  prismaMock.client.count.mockResolvedValue(1)
  prismaMock.client.create.mockResolvedValue(mockClient() as any)
  prismaMock.client.update.mockResolvedValue(mockClient() as any)
  prismaMock.client.delete.mockResolvedValue(mockClient() as any)

  // Training Session model (Session)
  prismaMock.session.findFirst.mockResolvedValue(mockTrainingSession() as any)
  prismaMock.session.findUnique.mockResolvedValue(mockTrainingSession() as any)
  prismaMock.session.findMany.mockResolvedValue([mockTrainingSession()] as any)
  prismaMock.session.count.mockResolvedValue(1)
  prismaMock.session.create.mockResolvedValue(mockTrainingSession() as any)
  prismaMock.session.update.mockResolvedValue(mockTrainingSession() as any)
  prismaMock.session.delete.mockResolvedValue(mockTrainingSession() as any)

  // Auth UserSession model
  prismaMock.userSession.findFirst.mockResolvedValue(mockUserSession() as any)
  prismaMock.userSession.findUnique.mockResolvedValue(mockUserSession() as any)
  prismaMock.userSession.create.mockResolvedValue(mockUserSession() as any)

  // Tenant model
  prismaMock.tenant.findUnique.mockResolvedValue(mockTenant() as any)
  prismaMock.tenant.findFirst.mockResolvedValue(mockTenant() as any)

  // User model
  prismaMock.user.findUnique.mockResolvedValue(mockUser() as any)
  prismaMock.user.findFirst.mockResolvedValue(mockUser() as any)
  prismaMock.user.create.mockResolvedValue(mockUser() as any)

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
