import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSetlists, createSetlist, getSetlistStats } from '@/lib/services/setlists'
import { z } from 'zod'


// Force dynamic to avoid build-time issues
export const dynamic = 'force-dynamic'
const songSchema = z.object({
  id: z.string(),
  title: z.string(),
  artist: z.string().optional(),
  duration: z.number(),
  key: z.string().optional(),
  bpm: z.number().optional(),
  notes: z.string().optional(),
  order: z.number(),
})

const createSetlistSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  gigId: z.string().optional(),
  totalDuration: z.number(),
  mood: z.string().optional(),
  songs: z.array(songSchema),
  aiGenerated: z.boolean().optional(),
  aiPrompt: z.string().optional(),
  notes: z.string().optional(),
})

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as any
    const gigId = searchParams.get('gigId') || undefined
    const search = searchParams.get('search') || undefined
    const stats = searchParams.get('stats') === 'true'

    if (stats) {
      const setlistStats = await getSetlistStats(session.user.tenantId)
      return NextResponse.json(setlistStats)
    }

    const result = await getSetlists(session.user.tenantId, { status, gigId, search })
    return NextResponse.json(result)
  } catch (error) {
    console.error('GET /api/setlists error:', error)
    return NextResponse.json({ error: 'Failed to fetch setlists' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validated = createSetlistSchema.parse(body)

    const setlist = await createSetlist({
      ...validated,
      tenantId: session.user.tenantId,
    })

    return NextResponse.json(setlist, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error('POST /api/setlists error:', error)
    return NextResponse.json({ error: 'Failed to create setlist' }, { status: 500 })
  }
}
