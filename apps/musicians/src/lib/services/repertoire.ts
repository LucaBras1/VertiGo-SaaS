import { prisma } from '@/lib/db'
import { Vertical } from '@/generated/prisma'

export interface CreateSongInput {
  tenantId: string
  title: string
  artist?: string
  genre?: string
  mood?: string
  duration: number
  key?: string
  bpm?: number
  difficulty?: string
  instruments?: string[]
  vocals?: string
  tags?: string[]
  spotifyUrl?: string
  youtubeUrl?: string
  sheetMusicUrl?: string
  notes?: string
}

export interface UpdateSongInput extends Partial<Omit<CreateSongInput, 'tenantId'>> {}

export async function getSongs(tenantId: string, options?: {
  search?: string
  mood?: string
  genre?: string
  limit?: number
  offset?: number
}) {
  const where: any = {
    tenantId,
    vertical: 'MUSICIANS' as Vertical,
  }

  if (options?.mood) {
    where.mood = options.mood
  }

  if (options?.genre) {
    where.genre = options.genre
  }

  if (options?.search) {
    where.OR = [
      { title: { contains: options.search, mode: 'insensitive' } },
      { artist: { contains: options.search, mode: 'insensitive' } },
    ]
  }

  const [songs, total] = await Promise.all([
    prisma.repertoireSong.findMany({
      where,
      orderBy: { title: 'asc' },
      take: options?.limit || 100,
      skip: options?.offset || 0,
    }),
    prisma.repertoireSong.count({ where }),
  ])

  return { songs, total }
}

export async function getSongById(id: string, tenantId: string) {
  return prisma.repertoireSong.findFirst({
    where: { id, tenantId },
  })
}

export async function createSong(input: CreateSongInput) {
  return prisma.repertoireSong.create({
    data: {
      ...input,
      vertical: 'MUSICIANS' as Vertical,
    },
  })
}

export async function updateSong(id: string, tenantId: string, input: UpdateSongInput) {
  const existing = await prisma.repertoireSong.findFirst({
    where: { id, tenantId },
  })

  if (!existing) {
    throw new Error('Song not found')
  }

  return prisma.repertoireSong.update({
    where: { id },
    data: input,
  })
}

export async function deleteSong(id: string, tenantId: string) {
  const existing = await prisma.repertoireSong.findFirst({
    where: { id, tenantId },
  })

  if (!existing) {
    throw new Error('Song not found')
  }

  return prisma.repertoireSong.delete({
    where: { id },
  })
}

export async function bulkCreateSongs(tenantId: string, songs: Omit<CreateSongInput, 'tenantId'>[]) {
  return prisma.repertoireSong.createMany({
    data: songs.map(song => ({
      ...song,
      tenantId,
      vertical: 'MUSICIANS' as Vertical,
    })),
  })
}

export async function getRepertoireStats(tenantId: string) {
  const [total, genres, moods, totalDuration] = await Promise.all([
    prisma.repertoireSong.count({ where: { tenantId } }),
    prisma.repertoireSong.groupBy({
      by: ['genre'],
      where: { tenantId, genre: { not: null } },
      _count: true,
    }),
    prisma.repertoireSong.groupBy({
      by: ['mood'],
      where: { tenantId, mood: { not: null } },
      _count: true,
    }),
    prisma.repertoireSong.aggregate({
      where: { tenantId },
      _sum: { duration: true },
    }),
  ])

  const mostPerformed = await prisma.repertoireSong.findFirst({
    where: { tenantId },
    orderBy: { timesPerformed: 'desc' },
  })

  return {
    total,
    genres: genres.length,
    moods: moods.map(m => m.mood).filter(Boolean) as string[],
    totalDuration: totalDuration._sum.duration || 0,
    mostPerformed: mostPerformed?.title || null,
  }
}
