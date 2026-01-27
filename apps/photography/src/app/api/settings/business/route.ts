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
    })

    if (!tenant) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // Return tenant details - note: website, phone, address would need schema extension
    return NextResponse.json({
      id: tenant.id,
      name: tenant.name,
      website: '',  // TODO: Add to schema
      phone: '',    // TODO: Add to schema
      address: '',  // TODO: Add to schema
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

    // Update tenant name only - other fields need schema extension
    const tenant = await prisma.tenant.update({
      where: { id: session.user.tenantId },
      data: {
        name: data.name,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      id: tenant.id,
      name: tenant.name,
      website: '',  // TODO: Add to schema
      phone: '',    // TODO: Add to schema
      address: '',  // TODO: Add to schema
    })
  } catch (error) {
    console.error('PUT /api/settings/business error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: 'Failed to update business settings' }, { status: 500 })
  }
}
