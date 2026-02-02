import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSetlistById, updateSetlist, deleteSetlist } from '@/lib/services/setlists'
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

const updateSetlistSchema = z.object({
  name: z.string().min(1).optional(),
  status: z.enum(['DRAFT', 'FINALIZED', 'PERFORMED']).optional(),
  gigId: z.string().optional().nullable(),
  totalDuration: z.number().optional(),
  mood: z.string().optional(),
  songs: z.array(songSchema).optional(),
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

    const setlist = await getSetlistById(params.id, session.user.tenantId)
    if (!setlist) {
      return NextResponse.json({ error: 'Setlist not found' }, { status: 404 })
    }

    return NextResponse.json(setlist)
  } catch (error) {
    console.error('GET /api/setlists/[id] error:', error)
    return NextResponse.json({ error: 'Failed to fetch setlist' }, { status: 500 })
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
    const validated = updateSetlistSchema.parse(body)

    // Convert null to undefined for gigId (Zod allows null, but service expects undefined)
    const updateInput = {
      ...validated,
      gigId: validated.gigId ?? undefined,
    }

    const setlist = await updateSetlist(params.id, session.user.tenantId, updateInput)
    return NextResponse.json(setlist)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    if (error instanceof Error && error.message === 'Setlist not found') {
      return NextResponse.json({ error: 'Setlist not found' }, { status: 404 })
    }
    console.error('PUT /api/setlists/[id] error:', error)
    return NextResponse.json({ error: 'Failed to update setlist' }, { status: 500 })
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

    await deleteSetlist(params.id, session.user.tenantId)
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message === 'Setlist not found') {
      return NextResponse.json({ error: 'Setlist not found' }, { status: 404 })
    }
    console.error('DELETE /api/setlists/[id] error:', error)
    return NextResponse.json({ error: 'Failed to delete setlist' }, { status: 500 })
  }
}
