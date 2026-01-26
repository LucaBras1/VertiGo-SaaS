import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSongById, updateSong, deleteSong } from '@/lib/services/repertoire'
import { z } from 'zod'

const updateSongSchema = z.object({
  title: z.string().min(1).optional(),
  artist: z.string().optional(),
  genre: z.string().optional(),
  mood: z.string().optional(),
  duration: z.number().optional(),
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

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const song = await getSongById(params.id, session.user.tenantId)
    if (!song) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 })
    }

    return NextResponse.json(song)
  } catch (error) {
    console.error('GET /api/repertoire/[id] error:', error)
    return NextResponse.json({ error: 'Failed to fetch song' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validated = updateSongSchema.parse(body)

    const song = await updateSong(params.id, session.user.tenantId, validated)
    return NextResponse.json(song)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    if (error instanceof Error && error.message === 'Song not found') {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 })
    }
    console.error('PUT /api/repertoire/[id] error:', error)
    return NextResponse.json({ error: 'Failed to update song' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await deleteSong(params.id, session.user.tenantId)
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message === 'Song not found') {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 })
    }
    console.error('DELETE /api/repertoire/[id] error:', error)
    return NextResponse.json({ error: 'Failed to delete song' }, { status: 500 })
  }
}
