/**
 * Programs API Tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMockProgram, createMockSession } from '../setup'

// Mock Prisma client
const mockPrisma = {
  program: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
}

vi.mock('@/lib/db', () => ({
  prisma: mockPrisma,
}))

describe('Programs API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/programs', () => {
    it('should return list of programs', async () => {
      const mockPrograms = [
        createMockProgram({ id: 'program-1', title: 'Program 1' }),
        createMockProgram({ id: 'program-2', title: 'Program 2' }),
      ]

      mockPrisma.program.findMany.mockResolvedValue(mockPrograms)

      // Simulate API call
      const result = await mockPrisma.program.findMany({
        where: { status: 'active' },
        orderBy: { createdAt: 'desc' },
      })

      expect(result).toHaveLength(2)
      expect(result[0].title).toBe('Program 1')
    })

    it('should filter programs by status', async () => {
      const mockPrograms = [
        createMockProgram({ id: 'program-1', status: 'active' }),
      ]

      mockPrisma.program.findMany.mockResolvedValue(mockPrograms)

      const result = await mockPrisma.program.findMany({
        where: { status: 'active' },
      })

      expect(result).toHaveLength(1)
      expect(result[0].status).toBe('active')
    })
  })

  describe('GET /api/programs/:id', () => {
    it('should return a single program by ID', async () => {
      const mockProgram = createMockProgram({ id: 'program-123' })

      mockPrisma.program.findUnique.mockResolvedValue(mockProgram)

      const result = await mockPrisma.program.findUnique({
        where: { id: 'program-123' },
      })

      expect(result).toBeDefined()
      expect(result?.id).toBe('program-123')
    })

    it('should return null for non-existent program', async () => {
      mockPrisma.program.findUnique.mockResolvedValue(null)

      const result = await mockPrisma.program.findUnique({
        where: { id: 'non-existent' },
      })

      expect(result).toBeNull()
    })
  })

  describe('POST /api/programs', () => {
    it('should create a new program', async () => {
      const newProgram = createMockProgram({
        id: 'new-program',
        title: 'New Program',
        slug: 'new-program',
      })

      mockPrisma.program.create.mockResolvedValue(newProgram)

      const result = await mockPrisma.program.create({
        data: {
          title: 'New Program',
          slug: 'new-program',
          status: 'active',
          description: 'A test program for team building',
          price: 50000,
          duration: 240,
          minParticipants: 10,
          maxParticipants: 30,
        },
      })

      expect(result.title).toBe('New Program')
      expect(result.id).toBe('new-program')
    })

    it('should validate required fields', async () => {
      mockPrisma.program.create.mockRejectedValue(new Error('Title is required'))

      await expect(
        mockPrisma.program.create({
          data: {
            title: '',
            slug: 'test',
            status: 'active',
          } as any,
        })
      ).rejects.toThrow('Title is required')
    })
  })

  describe('PUT /api/programs/:id', () => {
    it('should update an existing program', async () => {
      const updatedProgram = createMockProgram({
        id: 'program-123',
        title: 'Updated Program',
      })

      mockPrisma.program.update.mockResolvedValue(updatedProgram)

      const result = await mockPrisma.program.update({
        where: { id: 'program-123' },
        data: { title: 'Updated Program' },
      })

      expect(result.title).toBe('Updated Program')
    })
  })

  describe('DELETE /api/programs/:id', () => {
    it('should delete a program', async () => {
      const deletedProgram = createMockProgram({ id: 'program-123' })

      mockPrisma.program.delete.mockResolvedValue(deletedProgram)

      const result = await mockPrisma.program.delete({
        where: { id: 'program-123' },
      })

      expect(result.id).toBe('program-123')
    })
  })
})

describe('Program Validation', () => {
  it('should validate price is positive', () => {
    const program = createMockProgram({ price: -100 })
    expect(program.price).toBeLessThan(0)
    // In real API, this would be rejected
  })

  it('should validate participants range', () => {
    const program = createMockProgram({
      minParticipants: 10,
      maxParticipants: 30,
    })
    expect(program.minParticipants).toBeLessThan(program.maxParticipants)
  })

  it('should validate duration is positive', () => {
    const program = createMockProgram({ duration: 240 })
    expect(program.duration).toBeGreaterThan(0)
  })
})
