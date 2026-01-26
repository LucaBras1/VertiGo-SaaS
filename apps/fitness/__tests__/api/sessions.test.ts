/**
 * Integration tests for /api/sessions endpoints
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GET, POST } from '@/app/api/sessions/route'
import { prismaMock, setupPrismaMocks, mockSession, mockClient, mockTenant } from '../mocks/prisma'
import { createMockSession } from '../setup'

// Mock next-auth
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}))

vi.mock('@/lib/auth', () => ({
  authOptions: {},
}))

// Mock email service
vi.mock('@/lib/email', () => ({
  sendSessionReminderEmail: vi.fn().mockResolvedValue(undefined),
}))

describe('API /api/sessions', () => {
  beforeEach(() => {
    setupPrismaMocks()
    vi.clearAllMocks()
  })

  describe('GET /api/sessions', () => {
    it('should return 401 if not authenticated', async () => {
      const { getServerSession } = vi.mocked(require('next-auth'))
      getServerSession.mockResolvedValueOnce(null)

      const request = new Request('http://localhost:3006/api/sessions')
      const response = await GET(request)

      expect(response.status).toBe(401)
      const data = await response.json()
      expect(data.error).toBe('Unauthorized')
    })

    it('should return list of sessions', async () => {
      const { getServerSession } = vi.mocked(require('next-auth'))
      getServerSession.mockResolvedValueOnce(createMockSession())

      const mockSessions = [
        mockSession({ id: 'session-1', status: 'scheduled' }),
        mockSession({ id: 'session-2', status: 'completed' }),
      ]

      prismaMock.session.findMany.mockResolvedValueOnce(mockSessions as any)
      prismaMock.session.count.mockResolvedValueOnce(2)

      const request = new Request('http://localhost:3006/api/sessions')
      const response = await GET(request)

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.sessions).toHaveLength(2)
      expect(data.pagination).toEqual({
        page: 1,
        limit: 50,
        total: 2,
        totalPages: 1,
      })
    })

    it('should filter sessions by clientId', async () => {
      const { getServerSession } = vi.mocked(require('next-auth'))
      getServerSession.mockResolvedValueOnce(createMockSession())

      const request = new Request('http://localhost:3006/api/sessions?clientId=client-123')
      await GET(request)

      expect(prismaMock.session.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            clientId: 'client-123',
          }),
        })
      )
    })

    it('should filter sessions by status', async () => {
      const { getServerSession } = vi.mocked(require('next-auth'))
      getServerSession.mockResolvedValueOnce(createMockSession())

      const request = new Request('http://localhost:3006/api/sessions?status=completed')
      await GET(request)

      expect(prismaMock.session.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'completed',
          }),
        })
      )
    })

    it('should filter sessions by date range', async () => {
      const { getServerSession } = vi.mocked(require('next-auth'))
      getServerSession.mockResolvedValueOnce(createMockSession())

      const startDate = '2025-01-01'
      const endDate = '2025-01-31'
      const request = new Request(
        `http://localhost:3006/api/sessions?startDate=${startDate}&endDate=${endDate}`
      )
      await GET(request)

      expect(prismaMock.session.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            scheduledAt: {
              gte: expect.any(Date),
              lte: expect.any(Date),
            },
          }),
        })
      )
    })

    it('should support pagination', async () => {
      const { getServerSession } = vi.mocked(require('next-auth'))
      getServerSession.mockResolvedValueOnce(createMockSession())

      const request = new Request('http://localhost:3006/api/sessions?page=2&limit=25')
      await GET(request)

      expect(prismaMock.session.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 25,
          take: 25,
        })
      )
    })

    it('should include client data in response', async () => {
      const { getServerSession } = vi.mocked(require('next-auth'))
      getServerSession.mockResolvedValueOnce(createMockSession())

      const request = new Request('http://localhost:3006/api/sessions')
      await GET(request)

      expect(prismaMock.session.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: {
            client: expect.objectContaining({
              select: expect.any(Object),
            }),
          },
        })
      )
    })

    it('should order sessions by scheduledAt ascending', async () => {
      const { getServerSession } = vi.mocked(require('next-auth'))
      getServerSession.mockResolvedValueOnce(createMockSession())

      const request = new Request('http://localhost:3006/api/sessions')
      await GET(request)

      expect(prismaMock.session.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { scheduledAt: 'asc' },
        })
      )
    })

    it('should only return sessions for tenant', async () => {
      const { getServerSession } = vi.mocked(require('next-auth'))
      const session = createMockSession({ tenantId: 'tenant-999' })
      getServerSession.mockResolvedValueOnce(session)

      const request = new Request('http://localhost:3006/api/sessions')
      await GET(request)

      expect(prismaMock.session.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tenantId: 'tenant-999',
          }),
        })
      )
    })

    it('should handle database errors gracefully', async () => {
      const { getServerSession } = vi.mocked(require('next-auth'))
      getServerSession.mockResolvedValueOnce(createMockSession())

      prismaMock.session.findMany.mockRejectedValueOnce(new Error('Database error'))

      const request = new Request('http://localhost:3006/api/sessions')
      const response = await GET(request)

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.error).toBeDefined()
    })
  })

  describe('POST /api/sessions', () => {
    it('should return 401 if not authenticated', async () => {
      const { getServerSession } = vi.mocked(require('next-auth'))
      getServerSession.mockResolvedValueOnce(null)

      const request = new Request('http://localhost:3006/api/sessions', {
        method: 'POST',
        body: JSON.stringify({}),
      })
      const response = await POST(request)

      expect(response.status).toBe(401)
    })

    it('should create a new session', async () => {
      const { getServerSession } = vi.mocked(require('next-auth'))
      getServerSession.mockResolvedValueOnce(createMockSession())

      prismaMock.client.findFirst.mockResolvedValueOnce(mockClient() as any)
      prismaMock.tenant.findUnique.mockResolvedValueOnce(mockTenant() as any)
      prismaMock.session.create.mockResolvedValueOnce({
        ...mockSession(),
        client: mockClient(),
      } as any)

      const sessionData = {
        clientId: 'client-123',
        scheduledAt: '2025-02-01T10:00:00Z',
        duration: 60,
        muscleGroups: ['chest', 'triceps'],
        price: 500,
        notes: 'Focus on form',
      }

      const request = new Request('http://localhost:3006/api/sessions', {
        method: 'POST',
        body: JSON.stringify(sessionData),
      })
      const response = await POST(request)

      expect(response.status).toBe(201)
      expect(prismaMock.session.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            clientId: 'client-123',
            duration: 60,
            status: 'scheduled',
          }),
        })
      )
    })

    it('should return 400 for invalid data', async () => {
      const { getServerSession } = vi.mocked(require('next-auth'))
      getServerSession.mockResolvedValueOnce(createMockSession())

      const invalidData = {
        clientId: '', // Empty
        scheduledAt: '', // Empty
        duration: 300, // Too long
      }

      const request = new Request('http://localhost:3006/api/sessions', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      })
      const response = await POST(request)

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe('Neplatná data')
    })

    it('should return 404 if client not found', async () => {
      const { getServerSession } = vi.mocked(require('next-auth'))
      getServerSession.mockResolvedValueOnce(createMockSession())

      prismaMock.client.findFirst.mockResolvedValueOnce(null)

      const sessionData = {
        clientId: 'nonexistent-client',
        scheduledAt: '2025-02-01T10:00:00Z',
        duration: 60,
      }

      const request = new Request('http://localhost:3006/api/sessions', {
        method: 'POST',
        body: JSON.stringify(sessionData),
      })
      const response = await POST(request)

      expect(response.status).toBe(404)
      const data = await response.json()
      expect(data.error).toContain('nenalezen')
    })

    it('should verify client belongs to tenant', async () => {
      const { getServerSession } = vi.mocked(require('next-auth'))
      const session = createMockSession({ tenantId: 'tenant-123' })
      getServerSession.mockResolvedValueOnce(session)

      prismaMock.client.findFirst.mockResolvedValueOnce(mockClient() as any)

      const sessionData = {
        clientId: 'client-123',
        scheduledAt: '2025-02-01T10:00:00Z',
        duration: 60,
      }

      const request = new Request('http://localhost:3006/api/sessions', {
        method: 'POST',
        body: JSON.stringify(sessionData),
      })
      await POST(request)

      expect(prismaMock.client.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'client-123',
          tenantId: 'tenant-123',
        },
      })
    })

    it('should set default duration if not provided', async () => {
      const { getServerSession } = vi.mocked(require('next-auth'))
      getServerSession.mockResolvedValueOnce(createMockSession())

      prismaMock.client.findFirst.mockResolvedValueOnce(mockClient() as any)
      prismaMock.tenant.findUnique.mockResolvedValueOnce(mockTenant() as any)
      prismaMock.session.create.mockResolvedValueOnce({
        ...mockSession(),
        client: mockClient(),
      } as any)

      const sessionData = {
        clientId: 'client-123',
        scheduledAt: '2025-02-01T10:00:00Z',
        // duration omitted
      }

      const request = new Request('http://localhost:3006/api/sessions', {
        method: 'POST',
        body: JSON.stringify(sessionData),
      })
      await POST(request)

      expect(prismaMock.session.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            duration: 60, // Default
          }),
        })
      )
    })

    it('should send confirmation email to client', async () => {
      const { getServerSession } = vi.mocked(require('next-auth'))
      getServerSession.mockResolvedValueOnce(createMockSession())

      const { sendSessionReminderEmail } = vi.mocked(require('@/lib/email'))

      prismaMock.client.findFirst.mockResolvedValueOnce(mockClient() as any)
      prismaMock.tenant.findUnique.mockResolvedValueOnce(mockTenant() as any)
      prismaMock.session.create.mockResolvedValueOnce({
        ...mockSession(),
        client: mockClient(),
      } as any)

      const sessionData = {
        clientId: 'client-123',
        scheduledAt: '2025-02-01T10:00:00Z',
        duration: 60,
      }

      const request = new Request('http://localhost:3006/api/sessions', {
        method: 'POST',
        body: JSON.stringify(sessionData),
      })
      await POST(request)

      expect(sendSessionReminderEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: expect.any(String),
          clientName: expect.any(String),
          sessionDate: expect.any(String),
          sessionTime: expect.any(String),
          duration: 60,
        })
      )
    })

    it('should not fail if email sending fails', async () => {
      const { getServerSession } = vi.mocked(require('next-auth'))
      getServerSession.mockResolvedValueOnce(createMockSession())

      const { sendSessionReminderEmail } = vi.mocked(require('@/lib/email'))
      sendSessionReminderEmail.mockRejectedValueOnce(new Error('Email service down'))

      prismaMock.client.findFirst.mockResolvedValueOnce(mockClient() as any)
      prismaMock.tenant.findUnique.mockResolvedValueOnce(mockTenant() as any)
      prismaMock.session.create.mockResolvedValueOnce({
        ...mockSession(),
        client: mockClient(),
      } as any)

      const sessionData = {
        clientId: 'client-123',
        scheduledAt: '2025-02-01T10:00:00Z',
        duration: 60,
      }

      const request = new Request('http://localhost:3006/api/sessions', {
        method: 'POST',
        body: JSON.stringify(sessionData),
      })
      const response = await POST(request)

      expect(response.status).toBe(201)
    })

    it('should handle empty muscle groups array', async () => {
      const { getServerSession } = vi.mocked(require('next-auth'))
      getServerSession.mockResolvedValueOnce(createMockSession())

      prismaMock.client.findFirst.mockResolvedValueOnce(mockClient() as any)
      prismaMock.tenant.findUnique.mockResolvedValueOnce(mockTenant() as any)
      prismaMock.session.create.mockResolvedValueOnce({
        ...mockSession(),
        client: mockClient(),
      } as any)

      const sessionData = {
        clientId: 'client-123',
        scheduledAt: '2025-02-01T10:00:00Z',
        duration: 60,
        // muscleGroups omitted
      }

      const request = new Request('http://localhost:3006/api/sessions', {
        method: 'POST',
        body: JSON.stringify(sessionData),
      })
      await POST(request)

      expect(prismaMock.session.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            muscleGroups: [],
          }),
        })
      )
    })

    it('should associate session with correct tenant', async () => {
      const { getServerSession } = vi.mocked(require('next-auth'))
      const session = createMockSession({ tenantId: 'tenant-456' })
      getServerSession.mockResolvedValueOnce(session)

      prismaMock.client.findFirst.mockResolvedValueOnce(mockClient() as any)
      prismaMock.tenant.findUnique.mockResolvedValueOnce(mockTenant() as any)
      prismaMock.session.create.mockResolvedValueOnce({
        ...mockSession(),
        client: mockClient(),
      } as any)

      const sessionData = {
        clientId: 'client-123',
        scheduledAt: '2025-02-01T10:00:00Z',
        duration: 60,
      }

      const request = new Request('http://localhost:3006/api/sessions', {
        method: 'POST',
        body: JSON.stringify(sessionData),
      })
      await POST(request)

      expect(prismaMock.session.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tenantId: 'tenant-456',
          }),
        })
      )
    })

    it('should handle database errors gracefully', async () => {
      const { getServerSession } = vi.mocked(require('next-auth'))
      getServerSession.mockResolvedValueOnce(createMockSession())

      prismaMock.client.findFirst.mockResolvedValueOnce(mockClient() as any)
      prismaMock.session.create.mockRejectedValueOnce(new Error('Database error'))

      const sessionData = {
        clientId: 'client-123',
        scheduledAt: '2025-02-01T10:00:00Z',
        duration: 60,
      }

      const request = new Request('http://localhost:3006/api/sessions', {
        method: 'POST',
        body: JSON.stringify(sessionData),
      })
      const response = await POST(request)

      expect(response.status).toBe(500)
    })
  })
})
