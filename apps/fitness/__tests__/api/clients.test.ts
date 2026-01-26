/**
 * Integration tests for /api/clients endpoints
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GET, POST } from '@/app/api/clients/route'
import { prismaMock, setupPrismaMocks, mockClient } from '../mocks/prisma'
import { createMockSession } from '../setup'

// Mock next-auth
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}))

vi.mock('@/lib/auth', () => ({
  authOptions: {},
}))

describe('API /api/clients', () => {
  beforeEach(() => {
    setupPrismaMocks()
    vi.clearAllMocks()
  })

  describe('GET /api/clients', () => {
    it('should return 401 if not authenticated', async () => {
      const { getServerSession } = vi.mocked(require('next-auth'))
      getServerSession.mockResolvedValueOnce(null)

      const request = new Request('http://localhost:3006/api/clients')
      const response = await GET(request)

      expect(response.status).toBe(401)
      const data = await response.json()
      expect(data.error).toBe('Unauthorized')
    })

    it('should return list of clients', async () => {
      const { getServerSession } = vi.mocked(require('next-auth'))
      getServerSession.mockResolvedValueOnce(createMockSession())

      const mockClients = [
        mockClient({ id: 'client-1', name: 'John Doe' }),
        mockClient({ id: 'client-2', name: 'Jane Smith' }),
      ]

      prismaMock.client.findMany.mockResolvedValueOnce(mockClients as any)
      prismaMock.client.count.mockResolvedValueOnce(2)

      const request = new Request('http://localhost:3006/api/clients')
      const response = await GET(request)

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.clients).toHaveLength(2)
      expect(data.pagination).toEqual({
        page: 1,
        limit: 20,
        total: 2,
        totalPages: 1,
      })
    })

    it('should filter clients by search query', async () => {
      const { getServerSession } = vi.mocked(require('next-auth'))
      getServerSession.mockResolvedValueOnce(createMockSession())

      const request = new Request('http://localhost:3006/api/clients?search=John')
      await GET(request)

      expect(prismaMock.client.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.any(Array),
          }),
        })
      )
    })

    it('should filter clients by status', async () => {
      const { getServerSession } = vi.mocked(require('next-auth'))
      getServerSession.mockResolvedValueOnce(createMockSession())

      const request = new Request('http://localhost:3006/api/clients?status=active')
      await GET(request)

      expect(prismaMock.client.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'active',
          }),
        })
      )
    })

    it('should filter clients by fitness level', async () => {
      const { getServerSession } = vi.mocked(require('next-auth'))
      getServerSession.mockResolvedValueOnce(createMockSession())

      const request = new Request('http://localhost:3006/api/clients?fitnessLevel=intermediate')
      await GET(request)

      expect(prismaMock.client.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            fitnessLevel: 'intermediate',
          }),
        })
      )
    })

    it('should support pagination', async () => {
      const { getServerSession } = vi.mocked(require('next-auth'))
      getServerSession.mockResolvedValueOnce(createMockSession())

      const request = new Request('http://localhost:3006/api/clients?page=2&limit=10')
      await GET(request)

      expect(prismaMock.client.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        })
      )
    })

    it('should include measurements when requested', async () => {
      const { getServerSession } = vi.mocked(require('next-auth'))
      getServerSession.mockResolvedValueOnce(createMockSession())

      const request = new Request('http://localhost:3006/api/clients?includeMeasurements=true')
      await GET(request)

      expect(prismaMock.client.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            measurements: expect.any(Object),
          }),
        })
      )
    })

    it('should handle database errors gracefully', async () => {
      const { getServerSession } = vi.mocked(require('next-auth'))
      getServerSession.mockResolvedValueOnce(createMockSession())

      prismaMock.client.findMany.mockRejectedValueOnce(new Error('Database error'))

      const request = new Request('http://localhost:3006/api/clients')
      const response = await GET(request)

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.error).toBeDefined()
    })

    it('should only return clients for tenant', async () => {
      const { getServerSession } = vi.mocked(require('next-auth'))
      const session = createMockSession({ tenantId: 'tenant-456' })
      getServerSession.mockResolvedValueOnce(session)

      const request = new Request('http://localhost:3006/api/clients')
      await GET(request)

      expect(prismaMock.client.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tenantId: 'tenant-456',
          }),
        })
      )
    })
  })

  describe('POST /api/clients', () => {
    it('should return 401 if not authenticated', async () => {
      const { getServerSession } = vi.mocked(require('next-auth'))
      getServerSession.mockResolvedValueOnce(null)

      const request = new Request('http://localhost:3006/api/clients', {
        method: 'POST',
        body: JSON.stringify({}),
      })
      const response = await POST(request)

      expect(response.status).toBe(401)
    })

    it('should create a new client', async () => {
      const { getServerSession } = vi.mocked(require('next-auth'))
      getServerSession.mockResolvedValueOnce(createMockSession())

      prismaMock.client.findFirst.mockResolvedValueOnce(null) // No existing client
      prismaMock.client.create.mockResolvedValueOnce(mockClient() as any)

      const clientData = {
        name: 'Test Client',
        email: 'test@example.com',
        phone: '+420123456789',
        goals: ['weight_loss'],
        currentWeight: 85,
        height: 180,
        fitnessLevel: 'beginner',
      }

      const request = new Request('http://localhost:3006/api/clients', {
        method: 'POST',
        body: JSON.stringify(clientData),
      })
      const response = await POST(request)

      expect(response.status).toBe(201)
      expect(prismaMock.client.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: 'Test Client',
            email: 'test@example.com',
          }),
        })
      )
    })

    it('should return 400 for invalid data', async () => {
      const { getServerSession } = vi.mocked(require('next-auth'))
      getServerSession.mockResolvedValueOnce(createMockSession())

      const invalidData = {
        name: 'T', // Too short
        email: 'invalid-email',
      }

      const request = new Request('http://localhost:3006/api/clients', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      })
      const response = await POST(request)

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe('Neplatná data')
      expect(data.details).toBeDefined()
    })

    it('should return 400 if email already exists', async () => {
      const { getServerSession } = vi.mocked(require('next-auth'))
      getServerSession.mockResolvedValueOnce(createMockSession())

      prismaMock.client.findFirst.mockResolvedValueOnce(mockClient() as any) // Existing client

      const clientData = {
        name: 'Test Client',
        email: 'existing@example.com',
      }

      const request = new Request('http://localhost:3006/api/clients', {
        method: 'POST',
        body: JSON.stringify(clientData),
      })
      const response = await POST(request)

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toContain('existuje')
    })

    it('should set default values correctly', async () => {
      const { getServerSession } = vi.mocked(require('next-auth'))
      getServerSession.mockResolvedValueOnce(createMockSession())

      prismaMock.client.findFirst.mockResolvedValueOnce(null)
      prismaMock.client.create.mockResolvedValueOnce(mockClient() as any)

      const minimalData = {
        name: 'Test Client',
        email: 'test@example.com',
      }

      const request = new Request('http://localhost:3006/api/clients', {
        method: 'POST',
        body: JSON.stringify(minimalData),
      })
      await POST(request)

      expect(prismaMock.client.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            goals: [],
            tags: [],
            status: 'active',
            creditsRemaining: 0,
          }),
        })
      )
    })

    it('should handle date fields correctly', async () => {
      const { getServerSession } = vi.mocked(require('next-auth'))
      getServerSession.mockResolvedValueOnce(createMockSession())

      prismaMock.client.findFirst.mockResolvedValueOnce(null)
      prismaMock.client.create.mockResolvedValueOnce(mockClient() as any)

      const clientData = {
        name: 'Test Client',
        email: 'test@example.com',
        dateOfBirth: '1990-01-01',
        membershipExpiry: '2025-12-31',
      }

      const request = new Request('http://localhost:3006/api/clients', {
        method: 'POST',
        body: JSON.stringify(clientData),
      })
      await POST(request)

      expect(prismaMock.client.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            dateOfBirth: expect.any(Date),
            membershipExpiry: expect.any(Date),
          }),
        })
      )
    })

    it('should associate client with correct tenant', async () => {
      const { getServerSession } = vi.mocked(require('next-auth'))
      const session = createMockSession({ tenantId: 'tenant-789' })
      getServerSession.mockResolvedValueOnce(session)

      prismaMock.client.findFirst.mockResolvedValueOnce(null)
      prismaMock.client.create.mockResolvedValueOnce(mockClient() as any)

      const clientData = {
        name: 'Test Client',
        email: 'test@example.com',
      }

      const request = new Request('http://localhost:3006/api/clients', {
        method: 'POST',
        body: JSON.stringify(clientData),
      })
      await POST(request)

      expect(prismaMock.client.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tenantId: 'tenant-789',
          }),
        })
      )
    })

    it('should handle database errors gracefully', async () => {
      const { getServerSession } = vi.mocked(require('next-auth'))
      getServerSession.mockResolvedValueOnce(createMockSession())

      prismaMock.client.findFirst.mockResolvedValueOnce(null)
      prismaMock.client.create.mockRejectedValueOnce(new Error('Database error'))

      const clientData = {
        name: 'Test Client',
        email: 'test@example.com',
      }

      const request = new Request('http://localhost:3006/api/clients', {
        method: 'POST',
        body: JSON.stringify(clientData),
      })
      const response = await POST(request)

      expect(response.status).toBe(500)
    })
  })
})
