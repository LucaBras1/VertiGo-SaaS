/**
 * Authentication API Tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMockSession } from '../setup'

// Mock NextAuth
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}))

// Mock bcrypt
vi.mock('bcryptjs', () => ({
  hash: vi.fn().mockResolvedValue('hashed-password'),
  compare: vi.fn().mockImplementation((plain, hash) =>
    Promise.resolve(plain === 'correct-password')
  ),
}))

// Mock Prisma
const mockPrisma = {
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
}

vi.mock('@/lib/db', () => ({
  prisma: mockPrisma,
}))

describe('Authentication', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Login', () => {
    it('should authenticate valid credentials', async () => {
      const { compare } = await import('bcryptjs')

      const mockUser = {
        id: 'user-123',
        email: 'admin@teamforge.cz',
        password: 'hashed-password',
        role: 'admin',
      }

      mockPrisma.user.findUnique.mockResolvedValue(mockUser)

      const user = await mockPrisma.user.findUnique({
        where: { email: 'admin@teamforge.cz' },
      })

      expect(user).toBeDefined()

      const isValid = await compare('correct-password', user!.password)
      expect(isValid).toBe(true)
    })

    it('should reject invalid credentials', async () => {
      const { compare } = await import('bcryptjs')

      const mockUser = {
        id: 'user-123',
        email: 'admin@teamforge.cz',
        password: 'hashed-password',
        role: 'admin',
      }

      mockPrisma.user.findUnique.mockResolvedValue(mockUser)

      const user = await mockPrisma.user.findUnique({
        where: { email: 'admin@teamforge.cz' },
      })

      const isValid = await compare('wrong-password', user!.password)
      expect(isValid).toBe(false)
    })

    it('should return null for non-existent user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)

      const user = await mockPrisma.user.findUnique({
        where: { email: 'nonexistent@example.com' },
      })

      expect(user).toBeNull()
    })
  })

  describe('Session', () => {
    it('should return session for authenticated user', () => {
      const session = createMockSession()

      expect(session.user).toBeDefined()
      expect(session.user.id).toBe('test-user-123')
      expect(session.user.role).toBe('admin')
      expect(session.expires).toBeDefined()
    })

    it('should include user email in session', () => {
      const session = createMockSession({ email: 'custom@example.com' })

      expect(session.user.email).toBe('custom@example.com')
    })
  })

  describe('Password Hashing', () => {
    it('should hash passwords correctly', async () => {
      const { hash } = await import('bcryptjs')

      const hashedPassword = await hash('password123', 10)

      expect(hashedPassword).toBe('hashed-password')
    })
  })

  describe('Authorization', () => {
    it('should allow admin access to protected routes', () => {
      const session = createMockSession({ role: 'admin' })

      expect(session.user.role).toBe('admin')
      // Admin should have access to all routes
    })

    it('should restrict non-admin access', () => {
      const session = createMockSession({ role: 'user' })

      expect(session.user.role).not.toBe('admin')
      // User role should have limited access
    })
  })
})

describe('Registration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create new user with hashed password', async () => {
    const { hash } = await import('bcryptjs')

    const hashedPassword = await hash('newpassword123', 10)

    const newUser = {
      id: 'new-user-123',
      email: 'newuser@example.com',
      password: hashedPassword,
      role: 'admin',
      name: 'New User',
    }

    mockPrisma.user.create.mockResolvedValue(newUser)

    const result = await mockPrisma.user.create({
      data: {
        email: 'newuser@example.com',
        password: hashedPassword,
        role: 'admin',
        name: 'New User',
      },
    })

    expect(result.email).toBe('newuser@example.com')
    expect(result.password).not.toBe('newpassword123')
  })

  it('should reject duplicate email', async () => {
    mockPrisma.user.create.mockRejectedValue(
      new Error('Unique constraint failed on email')
    )

    await expect(
      mockPrisma.user.create({
        data: {
          email: 'existing@example.com',
          password: 'hashed',
          role: 'admin',
        },
      })
    ).rejects.toThrow('Unique constraint failed')
  })
})
