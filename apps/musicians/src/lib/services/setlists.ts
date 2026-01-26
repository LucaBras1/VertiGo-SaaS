import { prisma } from '@/lib/db'
import { SetlistStatus, Vertical } from '@/generated/prisma'

export interface SetlistSong {
  id: string
  title: string
  artist?: string
  duration: number
  key?: string
  bpm?: number
  notes?: string
  order: number
}

export interface CreateSetlistInput {
  tenantId: string
  name: string
  gigId?: string
  totalDuration: number
  mood?: string
  songs: SetlistSong[]
  aiGenerated?: boolean
  aiPrompt?: string
  notes?: string
}

export interface UpdateSetlistInput extends Partial<Omit<CreateSetlistInput, 'tenantId'>> {
  status?: SetlistStatus
}

export async function getSetlists(tenantId: string, options?: {
  status?: SetlistStatus
  gigId?: string
  search?: string
  limit?: number
  offset?: number
}) {
  const where: any = {
    tenantId,
    vertical: 'MUSICIANS' as Vertical,
  }

  if (options?.status) {
    where.status = options.status
  }

  if (options?.gigId) {
    where.gigId = options.gigId
  }

  if (options?.search) {
    where.name = { contains: options.search, mode: 'insensitive' }
  }

  const [setlists, total] = await Promise.all([
    prisma.setlist.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: options?.limit || 50,
      skip: options?.offset || 0,
      include: {
        gig: {
          select: {
            id: true,
            title: true,
            eventDate: true,
          },
        },
      },
    }),
    prisma.setlist.count({ where }),
  ])

  return { setlists, total }
}

export async function getSetlistById(id: string, tenantId: string) {
  return prisma.setlist.findFirst({
    where: { id, tenantId },
    include: {
      gig: true,
    },
  })
}

export async function createSetlist(input: CreateSetlistInput) {
  return prisma.setlist.create({
    data: {
      tenantId: input.tenantId,
      vertical: 'MUSICIANS' as Vertical,
      name: input.name,
      gigId: input.gigId,
      totalDuration: input.totalDuration,
      mood: input.mood,
      songs: JSON.parse(JSON.stringify(input.songs)),
      aiGenerated: input.aiGenerated || false,
      aiPrompt: input.aiPrompt,
      generatedAt: input.aiGenerated ? new Date() : undefined,
      notes: input.notes,
      status: 'DRAFT' as SetlistStatus,
    },
  })
}

export async function updateSetlist(id: string, tenantId: string, input: UpdateSetlistInput) {
  const existing = await prisma.setlist.findFirst({
    where: { id, tenantId },
  })

  if (!existing) {
    throw new Error('Setlist not found')
  }

  return prisma.setlist.update({
    where: { id },
    data: {
      ...input,
      songs: input.songs ? JSON.parse(JSON.stringify(input.songs)) : undefined,
    },
  })
}

export async function deleteSetlist(id: string, tenantId: string) {
  const existing = await prisma.setlist.findFirst({
    where: { id, tenantId },
  })

  if (!existing) {
    throw new Error('Setlist not found')
  }

  return prisma.setlist.delete({
    where: { id },
  })
}

export async function getSetlistStats(tenantId: string) {
  const [total, finalized, aiGenerated, totalSongs] = await Promise.all([
    prisma.setlist.count({ where: { tenantId } }),
    prisma.setlist.count({ where: { tenantId, status: 'FINALIZED' } }),
    prisma.setlist.count({ where: { tenantId, aiGenerated: true } }),
    prisma.setlist.findMany({
      where: { tenantId },
      select: { songs: true },
    }),
  ])

  // Count total songs across all setlists
  const songCount = totalSongs.reduce((sum, setlist) => {
    const songs = setlist.songs as SetlistSong[] | null
    return sum + (songs?.length || 0)
  }, 0)

  return {
    total,
    finalized,
    aiGenerated,
    totalSongs: songCount,
  }
}
