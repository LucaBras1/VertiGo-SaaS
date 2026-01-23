import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const package_ = await prisma.package.findFirst({
      where: {
        id: params.id,
        tenantId: session.user.tenantId
      },
      include: {
        client: true,
        shoots: true,
        addons: true,
        invoices: true,
        shotLists: true
      }
    })

    if (!package_) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 })
    }

    return NextResponse.json(package_)
  } catch (error) {
    console.error('GET /api/packages/[id] error:', error)
    return NextResponse.json({ error: 'Failed to fetch package' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()

    const package_ = await prisma.package.findFirst({
      where: {
        id: params.id,
        tenantId: session.user.tenantId
      }
    })

    if (!package_) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 })
    }

    const updated = await prisma.package.update({
      where: { id: params.id },
      data: {
        ...body,
        eventDate: body.eventDate ? new Date(body.eventDate) : undefined,
        updatedAt: new Date()
      },
      include: {
        client: true
      }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('PUT /api/packages/[id] error:', error)
    return NextResponse.json({ error: 'Failed to update package' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const package_ = await prisma.package.findFirst({
      where: {
        id: params.id,
        tenantId: session.user.tenantId
      }
    })

    if (!package_) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 })
    }

    await prisma.package.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/packages/[id] error:', error)
    return NextResponse.json({ error: 'Failed to delete package' }, { status: 500 })
  }
}
