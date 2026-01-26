/**
 * Integration tests for /api/auth/signup endpoint
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { POST } from '@/app/api/auth/signup/route'
import { prismaMock, setupPrismaMocks, mockUser, mockTenant } from '../mocks/prisma'

// Mock bcryptjs
vi.mock('bcryptjs', () => ({
  hash: vi.fn().mockResolvedValue('hashed-password-123'),
}))

// Mock email service
vi.mock('@/lib/email', () => ({
  sendWelcomeEmail: vi.fn().mockResolvedValue(undefined),
}))

describe('API /api/auth/signup', () => {
  beforeEach(() => {
    setupPrismaMocks()
    vi.clearAllMocks()
  })

  describe('POST /api/auth/signup', () => {
    it('should create new user and tenant', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(null) // No existing user
      prismaMock.tenant.findUnique.mockResolvedValueOnce(null) // Slug available

      const newTenant = mockTenant({ id: 'new-tenant-123' })
      const newUser = mockUser({ id: 'new-user-123', tenantId: 'new-tenant-123' })

      prismaMock.$transaction.mockImplementation(async (callback: any) => {
        return callback({
          tenant: {
            create: vi.fn().mockResolvedValue(newTenant),
          },
          user: {
            create: vi.fn().mockResolvedValue(newUser),
          },
        })
      })

      const signupData = {
        name: 'John Trainer',
        email: 'john@example.com',
        password: 'SecurePass123',
        studioName: 'John\'s Fitness Studio',
      }

      const request = new Request('http://localhost:3006/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(signupData),
      })
      const response = await POST(request)

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.message).toBe('Registrace úspěšná')
      expect(data.user).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String),
          email: expect.any(String),
        })
      )
      expect(data.user.password).toBeUndefined() // Should not return password
    })

    it('should return 400 if email already exists', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(mockUser() as any) // Existing user

      const signupData = {
        name: 'Jane Trainer',
        email: 'existing@example.com',
        password: 'SecurePass123',
        studioName: 'Jane\'s Studio',
      }

      const request = new Request('http://localhost:3006/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(signupData),
      })
      const response = await POST(request)

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toContain('existuje')
    })

    it('should validate input data', async () => {
      const invalidData = {
        name: 'J', // Too short
        email: 'invalid-email',
        password: '12345', // Too short
        studioName: 'S', // Too short
      }

      const request = new Request('http://localhost:3006/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      })
      const response = await POST(request)

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe('Neplatná data')
      expect(data.details).toBeDefined()
    })

    it('should hash password before storing', async () => {
      const { hash } = vi.mocked(require('bcryptjs'))

      prismaMock.user.findUnique.mockResolvedValueOnce(null)
      prismaMock.tenant.findUnique.mockResolvedValueOnce(null)

      const newTenant = mockTenant()
      const newUser = mockUser()

      prismaMock.$transaction.mockImplementation(async (callback: any) => {
        return callback({
          tenant: {
            create: vi.fn().mockResolvedValue(newTenant),
          },
          user: {
            create: vi.fn().mockResolvedValue(newUser),
          },
        })
      })

      const signupData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'PlainTextPassword',
        studioName: 'Test Studio',
      }

      const request = new Request('http://localhost:3006/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(signupData),
      })
      await POST(request)

      expect(hash).toHaveBeenCalledWith('PlainTextPassword', 12)
    })

    it('should create slug from studio name', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(null)
      prismaMock.tenant.findUnique.mockResolvedValueOnce(null)

      let capturedSlug: string | undefined

      prismaMock.$transaction.mockImplementation(async (callback: any) => {
        const mockTx = {
          tenant: {
            create: vi.fn().mockImplementation(({ data }: any) => {
              capturedSlug = data.slug
              return Promise.resolve(mockTenant({ slug: data.slug }))
            }),
          },
          user: {
            create: vi.fn().mockResolvedValue(mockUser()),
          },
        }
        return callback(mockTx)
      })

      const signupData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'SecurePass123',
        studioName: 'Awesome Fitness Studio',
      }

      const request = new Request('http://localhost:3006/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(signupData),
      })
      await POST(request)

      expect(capturedSlug).toBe('awesome-fitness-studio')
    })

    it('should handle special characters in studio name slug', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(null)
      prismaMock.tenant.findUnique.mockResolvedValueOnce(null)

      let capturedSlug: string | undefined

      prismaMock.$transaction.mockImplementation(async (callback: any) => {
        const mockTx = {
          tenant: {
            create: vi.fn().mockImplementation(({ data }: any) => {
              capturedSlug = data.slug
              return Promise.resolve(mockTenant({ slug: data.slug }))
            }),
          },
          user: {
            create: vi.fn().mockResolvedValue(mockUser()),
          },
        }
        return callback(mockTx)
      })

      const signupData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'SecurePass123',
        studioName: 'Fitko & Wellness - Správná volba!',
      }

      const request = new Request('http://localhost:3006/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(signupData),
      })
      await POST(request)

      // Should normalize to safe slug
      expect(capturedSlug).toMatch(/^[a-z0-9-]+$/)
      expect(capturedSlug).not.toContain('&')
      expect(capturedSlug).not.toContain(' ')
    })

    it('should handle Czech characters in slug', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(null)
      prismaMock.tenant.findUnique.mockResolvedValueOnce(null)

      let capturedSlug: string | undefined

      prismaMock.$transaction.mockImplementation(async (callback: any) => {
        const mockTx = {
          tenant: {
            create: vi.fn().mockImplementation(({ data }: any) => {
              capturedSlug = data.slug
              return Promise.resolve(mockTenant({ slug: data.slug }))
            }),
          },
          user: {
            create: vi.fn().mockResolvedValue(mockUser()),
          },
        }
        return callback(mockTx)
      })

      const signupData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'SecurePass123',
        studioName: 'Tělocvična Šťastná',
      }

      const request = new Request('http://localhost:3006/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(signupData),
      })
      await POST(request)

      // Should remove Czech diacritics
      expect(capturedSlug).toBe('telocvicna-stastna')
    })

    it('should append timestamp if slug already exists', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(null)
      prismaMock.tenant.findUnique.mockResolvedValueOnce(mockTenant() as any) // Slug taken

      let capturedSlug: string | undefined

      prismaMock.$transaction.mockImplementation(async (callback: any) => {
        const mockTx = {
          tenant: {
            create: vi.fn().mockImplementation(({ data }: any) => {
              capturedSlug = data.slug
              return Promise.resolve(mockTenant({ slug: data.slug }))
            }),
          },
          user: {
            create: vi.fn().mockResolvedValue(mockUser()),
          },
        }
        return callback(mockTx)
      })

      const signupData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'SecurePass123',
        studioName: 'Popular Studio',
      }

      const request = new Request('http://localhost:3006/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(signupData),
      })
      await POST(request)

      // Should append timestamp
      expect(capturedSlug).toMatch(/^popular-studio-\d+$/)
    })

    it('should set correct tenant properties', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(null)
      prismaMock.tenant.findUnique.mockResolvedValueOnce(null)

      let capturedTenantData: any

      prismaMock.$transaction.mockImplementation(async (callback: any) => {
        const mockTx = {
          tenant: {
            create: vi.fn().mockImplementation(({ data }: any) => {
              capturedTenantData = data
              return Promise.resolve(mockTenant())
            }),
          },
          user: {
            create: vi.fn().mockResolvedValue(mockUser()),
          },
        }
        return callback(mockTx)
      })

      const signupData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'SecurePass123',
        studioName: 'Test Studio',
      }

      const request = new Request('http://localhost:3006/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(signupData),
      })
      await POST(request)

      expect(capturedTenantData.vertical).toBe('FITNESS')
      expect(capturedTenantData.subscriptionTier).toBe('free')
      expect(capturedTenantData.aiCredits).toBe(100)
    })

    it('should set user role to admin', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(null)
      prismaMock.tenant.findUnique.mockResolvedValueOnce(null)

      let capturedUserData: any

      prismaMock.$transaction.mockImplementation(async (callback: any) => {
        const mockTx = {
          tenant: {
            create: vi.fn().mockResolvedValue(mockTenant()),
          },
          user: {
            create: vi.fn().mockImplementation(({ data }: any) => {
              capturedUserData = data
              return Promise.resolve(mockUser())
            }),
          },
        }
        return callback(mockTx)
      })

      const signupData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'SecurePass123',
        studioName: 'Test Studio',
      }

      const request = new Request('http://localhost:3006/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(signupData),
      })
      await POST(request)

      expect(capturedUserData.role).toBe('admin')
    })

    it('should send welcome email', async () => {
      const { sendWelcomeEmail } = vi.mocked(require('@/lib/email'))

      prismaMock.user.findUnique.mockResolvedValueOnce(null)
      prismaMock.tenant.findUnique.mockResolvedValueOnce(null)

      prismaMock.$transaction.mockImplementation(async (callback: any) => {
        return callback({
          tenant: {
            create: vi.fn().mockResolvedValue(mockTenant()),
          },
          user: {
            create: vi.fn().mockResolvedValue(mockUser()),
          },
        })
      })

      const signupData = {
        name: 'John Trainer',
        email: 'john@example.com',
        password: 'SecurePass123',
        studioName: 'Test Studio',
      }

      const request = new Request('http://localhost:3006/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(signupData),
      })
      await POST(request)

      expect(sendWelcomeEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'john@example.com',
          name: 'John Trainer',
          loginUrl: expect.stringContaining('/auth/signin'),
        })
      )
    })

    it('should not fail if email sending fails', async () => {
      const { sendWelcomeEmail } = vi.mocked(require('@/lib/email'))
      sendWelcomeEmail.mockRejectedValueOnce(new Error('Email service down'))

      prismaMock.user.findUnique.mockResolvedValueOnce(null)
      prismaMock.tenant.findUnique.mockResolvedValueOnce(null)

      prismaMock.$transaction.mockImplementation(async (callback: any) => {
        return callback({
          tenant: {
            create: vi.fn().mockResolvedValue(mockTenant()),
          },
          user: {
            create: vi.fn().mockResolvedValue(mockUser()),
          },
        })
      })

      const signupData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'SecurePass123',
        studioName: 'Test Studio',
      }

      const request = new Request('http://localhost:3006/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(signupData),
      })
      const response = await POST(request)

      expect(response.status).toBe(200)
    })

    it('should rollback transaction on database error', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(null)
      prismaMock.tenant.findUnique.mockResolvedValueOnce(null)

      prismaMock.$transaction.mockRejectedValueOnce(new Error('Database error'))

      const signupData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'SecurePass123',
        studioName: 'Test Studio',
      }

      const request = new Request('http://localhost:3006/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(signupData),
      })
      const response = await POST(request)

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.error).toBeDefined()
    })

    it('should handle missing fields gracefully', async () => {
      const incompleteData = {
        name: 'Test User',
        // Missing email, password, studioName
      }

      const request = new Request('http://localhost:3006/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(incompleteData),
      })
      const response = await POST(request)

      expect(response.status).toBe(400)
    })
  })
})
