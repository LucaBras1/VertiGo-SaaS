import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getGigs, createGig, getGigStats } from '@/lib/services/gigs'
import { z } from 'zod'

const createGigSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  clientName: z.string().optional(),
  clientEmail: z.string().email().optional().or(z.literal('')),
  clientPhone: z.string().optional(),
  eventType: z.string().optional(),
  eventDate: z.string().datetime().optional(),
  eventDuration: z.number().optional(),
  venue: z.object({
    name: z.string(),
    address: z.string().optional(),
    city: z.string().optional(),
    type: z.enum(['indoor', 'outdoor']).optional(),
  }).optional(),
  audienceSize: z.number().optional(),
  bandMembers: z.number().optional(),
  genres: z.array(z.string()).optional(),
  setDuration: z.number().optional(),
  numberOfSets: z.number().optional(),
  basePrice: z.number().optional(),
  travelCosts: z.number().optional(),
  description: z.string().optional(),
  internalNotes: z.string().optional(),
})

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as any
    const search = searchParams.get('search') || undefined
    const stats = searchParams.get('stats') === 'true'

    if (stats) {
      const gigStats = await getGigStats(session.user.tenantId)
      return NextResponse.json(gigStats)
    }

    const result = await getGigs(session.user.tenantId, { status, search })
    return NextResponse.json(result)
  } catch (error) {
    console.error('GET /api/gigs error:', error)
    return NextResponse.json({ error: 'Failed to fetch gigs' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validated = createGigSchema.parse(body)

    const gig = await createGig({
      ...validated,
      tenantId: session.user.tenantId,
      eventDate: validated.eventDate ? new Date(validated.eventDate) : undefined,
    })

    return NextResponse.json(gig, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error('POST /api/gigs error:', error)
    return NextResponse.json({ error: 'Failed to create gig' }, { status: 500 })
  }
}
