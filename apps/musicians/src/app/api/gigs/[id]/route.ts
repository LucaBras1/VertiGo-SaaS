import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getGigById, updateGig, deleteGig } from '@/lib/services/gigs'
import { z } from 'zod'


// Force dynamic to avoid build-time issues
export const dynamic = 'force-dynamic'
const updateGigSchema = z.object({
  title: z.string().min(1).optional(),
  status: z.enum(['INQUIRY', 'QUOTE_SENT', 'CONFIRMED', 'COMPLETED', 'CANCELLED']).optional(),
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
  deposit: z.number().optional(),
  depositPaid: z.boolean().optional(),
  description: z.string().optional(),
  internalNotes: z.string().optional(),
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

    const gig = await getGigById(params.id, session.user.tenantId)
    if (!gig) {
      return NextResponse.json({ error: 'Gig not found' }, { status: 404 })
    }

    return NextResponse.json(gig)
  } catch (error) {
    console.error('GET /api/gigs/[id] error:', error)
    return NextResponse.json({ error: 'Failed to fetch gig' }, { status: 500 })
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
    const validated = updateGigSchema.parse(body)

    const gig = await updateGig(params.id, session.user.tenantId, {
      ...validated,
      eventDate: validated.eventDate ? new Date(validated.eventDate) : undefined,
    })

    return NextResponse.json(gig)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    if (error instanceof Error && error.message === 'Gig not found') {
      return NextResponse.json({ error: 'Gig not found' }, { status: 404 })
    }
    console.error('PUT /api/gigs/[id] error:', error)
    return NextResponse.json({ error: 'Failed to update gig' }, { status: 500 })
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

    await deleteGig(params.id, session.user.tenantId)
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message === 'Gig not found') {
      return NextResponse.json({ error: 'Gig not found' }, { status: 404 })
    }
    console.error('DELETE /api/gigs/[id] error:', error)
    return NextResponse.json({ error: 'Failed to delete gig' }, { status: 500 })
  }
}
