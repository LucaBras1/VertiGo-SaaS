import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const UpdateBusinessSchema = z.object({
  name: z.string().min(1).max(100),
  website: z.string().url().optional().or(z.literal('')),
  phone: z.string().max(30).optional(),
  address: z.string().max(500).optional(),
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: session.user.tenantId },
      select: {
        id: true,
        name: true,
        settings: true,
      }
    })

    if (!tenant) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // Extract business settings from JSON settings field
    const settings = (tenant.settings as Record<string, unknown>) || {}

    return NextResponse.json({
      id: tenant.id,
      name: tenant.name,
      website: settings.website || '',
      phone: settings.phone || '',
      address: settings.address || '',
    })
  } catch (error) {
    console.error('GET /api/settings/business error:', error)
    return NextResponse.json({ error: 'Failed to fetch business settings' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = UpdateBusinessSchema.parse(body)

    // Get current tenant settings
    const currentTenant = await prisma.tenant.findUnique({
      where: { id: session.user.tenantId },
      select: { settings: true }
    })

    const currentSettings = (currentTenant?.settings as Record<string, unknown>) || {}

    // Update tenant with new settings
    const tenant = await prisma.tenant.update({
      where: { id: session.user.tenantId },
      data: {
        name: data.name,
        settings: {
          ...currentSettings,
          website: data.website || '',
          phone: data.phone || '',
          address: data.address || '',
        },
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        settings: true,
      }
    })

    const settings = (tenant.settings as Record<string, unknown>) || {}

    return NextResponse.json({
      id: tenant.id,
      name: tenant.name,
      website: settings.website || '',
      phone: settings.phone || '',
      address: settings.address || '',
    })
  } catch (error) {
    console.error('PUT /api/settings/business error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: 'Failed to update business settings' }, { status: 500 })
  }
}
