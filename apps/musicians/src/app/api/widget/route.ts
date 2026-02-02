import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getWidget, createWidget, updateWidget } from '@/lib/services/booking-widget'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const updateWidgetSchema = z.object({
  displayName: z.string().optional(),
  displayBio: z.string().optional(),
  displayPhoto: z.string().url().optional().or(z.literal('')),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  allowedEventTypes: z.array(z.string()).optional(),
  minNoticeHours: z.number().min(0).max(720).optional(),
  maxSubmissionsPerDay: z.number().min(1).max(1000).optional(),
  successMessage: z.string().optional(),
  isActive: z.boolean().optional(),
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const widget = await getWidget(session.user.tenantId)
    return NextResponse.json({ success: true, data: widget })
  } catch (error) {
    console.error('GET /api/widget error:', error)
    return NextResponse.json({ error: 'Failed to fetch widget' }, { status: 500 })
  }
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if widget already exists
    const existing = await getWidget(session.user.tenantId)
    if (existing) {
      return NextResponse.json({ error: 'Widget already exists' }, { status: 400 })
    }

    // Get tenant info for defaults
    const { prisma } = await import('@/lib/db')
    const tenant = await prisma.tenant.findUnique({
      where: { id: session.user.tenantId }
    })

    const widget = await createWidget({
      tenantId: session.user.tenantId,
      displayName: tenant?.bandName || undefined,
      displayBio: tenant?.bandBio || undefined,
      displayPhoto: tenant?.logoUrl || undefined,
    })

    return NextResponse.json({ success: true, data: widget }, { status: 201 })
  } catch (error) {
    console.error('POST /api/widget error:', error)
    return NextResponse.json({ error: 'Failed to create widget' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validated = updateWidgetSchema.parse(body)

    const widget = await updateWidget(session.user.tenantId, validated)
    return NextResponse.json({ success: true, data: widget })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error('PATCH /api/widget error:', error)
    return NextResponse.json({ error: 'Failed to update widget' }, { status: 500 })
  }
}
