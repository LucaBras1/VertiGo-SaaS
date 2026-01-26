import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const UpdateTenantSettingsSchema = z.object({
  bandName: z.string().max(200).optional(),
  bandBio: z.string().max(2000).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(50).optional(),
  website: z.string().url().optional().or(z.literal('')),
})

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = UpdateTenantSettingsSchema.parse(body)

    // Filter out undefined values
    const updateData: Record<string, string | null> = {}
    if (data.bandName !== undefined) updateData.bandName = data.bandName || null
    if (data.bandBio !== undefined) updateData.bandBio = data.bandBio || null
    if (data.email !== undefined) updateData.email = data.email
    if (data.phone !== undefined) updateData.phone = data.phone || null
    if (data.website !== undefined) updateData.website = data.website || null

    const updatedTenant = await prisma.tenant.update({
      where: { id: session.user.tenantId },
      data: updateData,
      select: {
        id: true,
        name: true,
        bandName: true,
        bandBio: true,
        email: true,
        phone: true,
        website: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedTenant,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('PATCH /api/tenant/settings error:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: session.user.tenantId },
      select: {
        id: true,
        name: true,
        bandName: true,
        bandBio: true,
        email: true,
        phone: true,
        website: true,
      },
    })

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: tenant,
    })
  } catch (error) {
    console.error('GET /api/tenant/settings error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}
