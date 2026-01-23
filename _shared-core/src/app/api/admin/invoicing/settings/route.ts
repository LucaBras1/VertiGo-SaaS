/**
 * Invoicing Settings API Routes
 *
 * GET /api/admin/invoicing/settings - Get settings
 * PUT /api/admin/invoicing/settings - Update settings
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get or create settings
    let settings = await prisma.invoicingSettings.findUnique({
      where: { id: 'singleton' },
    })

    if (!settings) {
      settings = await prisma.invoicingSettings.create({
        data: { id: 'singleton' },
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Failed to get invoicing settings:', error)
    return NextResponse.json(
      { error: 'Failed to get settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()

    // Remove id from update data
    const { id, createdAt, updatedAt, ...updateData } = data

    const settings = await prisma.invoicingSettings.upsert({
      where: { id: 'singleton' },
      create: { id: 'singleton', ...updateData },
      update: updateData,
    })

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Failed to update invoicing settings:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
