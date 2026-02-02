import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  getInquiryById,
  updateInquiryStatus,
  convertInquiryToGig,
} from '@/lib/services/booking-widget'
import { BookingInquiryStatus } from '@/generated/prisma'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const updateSchema = z.object({
  status: z.enum(['NEW', 'REVIEWED', 'CONVERTED', 'REJECTED']),
})

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const inquiry = await getInquiryById(id, session.user.tenantId)

    if (!inquiry) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: inquiry })
  } catch (error) {
    console.error('GET /api/inquiries/[id] error:', error)
    return NextResponse.json({ error: 'Failed to fetch inquiry' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const validated = updateSchema.parse(body)

    const inquiry = await updateInquiryStatus(
      id,
      session.user.tenantId,
      validated.status as BookingInquiryStatus
    )

    return NextResponse.json({ success: true, data: inquiry })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    if (error instanceof Error && error.message === 'Inquiry not found') {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })
    }
    console.error('PATCH /api/inquiries/[id] error:', error)
    return NextResponse.json({ error: 'Failed to update inquiry' }, { status: 500 })
  }
}
