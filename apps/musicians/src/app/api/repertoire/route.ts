import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSongs, createSong, getRepertoireStats, bulkCreateSongs } from '@/lib/services/repertoire'
import { z } from 'zod'

const createSongSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  artist: z.string().optional(),
  genre: z.string().optional(),
  mood: z.string().optional(),
  duration: z.number().min(1, 'Duration is required'),
  key: z.string().optional(),
  bpm: z.number().optional(),
  difficulty: z.string().optional(),
  instruments: z.array(z.string()).optional(),
  vocals: z.string().optional(),
  tags: z.array(z.string()).optional(),
  spotifyUrl: z.string().url().optional().or(z.literal('')),
  youtubeUrl: z.string().url().optional().or(z.literal('')),
  sheetMusicUrl: z.string().url().optional().or(z.literal('')),
  notes: z.string().optional(),
})

const bulkCreateSchema = z.object({
  songs: z.array(createSongSchema),
})

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || undefined
    const mood = searchParams.get('mood') || undefined
    const genre = searchParams.get('genre') || undefined
    const stats = searchParams.get('stats') === 'true'

    if (stats) {
      const repertoireStats = await getRepertoireStats(session.user.tenantId)
      return NextResponse.json(repertoireStats)
    }

    const result = await getSongs(session.user.tenantId, { search, mood, genre })
    return NextResponse.json(result)
  } catch (error) {
    console.error('GET /api/repertoire error:', error)
    return NextResponse.json({ error: 'Failed to fetch songs' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Check if bulk import
    if (body.songs && Array.isArray(body.songs)) {
      const validated = bulkCreateSchema.parse(body)
      const result = await bulkCreateSongs(session.user.tenantId, validated.songs)
      return NextResponse.json({ count: result.count }, { status: 201 })
    }

    // Single song creation
    const validated = createSongSchema.parse(body)
    const song = await createSong({
      ...validated,
      tenantId: session.user.tenantId,
    })

    return NextResponse.json(song, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error('POST /api/repertoire error:', error)
    return NextResponse.json({ error: 'Failed to create song' }, { status: 500 })
  }
}
