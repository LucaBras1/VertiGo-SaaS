import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Force dynamic to avoid build-time Prisma proxy issues
export const dynamic = 'force-dynamic'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const gallery = await prisma.gallery.findFirst({
      where: {
        id: params.id,
        shoot: {
          tenantId: session.user.tenantId
        }
      },
      include: {
        shoot: {
          include: {
            package: {
              include: {
                client: true
              }
            }
          }
        },
        photos: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!gallery) {
      return NextResponse.json({ error: 'Gallery not found' }, { status: 404 })
    }

    return NextResponse.json(gallery)
  } catch (error) {
    console.error('GET /api/galleries/[id] error:', error)
    return NextResponse.json({ error: 'Failed to fetch gallery' }, { status: 500 })
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

    const gallery = await prisma.gallery.findFirst({
      where: {
        id: params.id,
        shoot: {
          tenantId: session.user.tenantId
        }
      }
    })

    if (!gallery) {
      return NextResponse.json({ error: 'Gallery not found' }, { status: 404 })
    }

    const updated = await prisma.gallery.update({
      where: { id: params.id },
      data: {
        ...body,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
        updatedAt: new Date()
      }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('PUT /api/galleries/[id] error:', error)
    return NextResponse.json({ error: 'Failed to update gallery' }, { status: 500 })
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

    const gallery = await prisma.gallery.findFirst({
      where: {
        id: params.id,
        shoot: {
          tenantId: session.user.tenantId
        }
      }
    })

    if (!gallery) {
      return NextResponse.json({ error: 'Gallery not found' }, { status: 404 })
    }

    await prisma.gallery.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/galleries/[id] error:', error)
    return NextResponse.json({ error: 'Failed to delete gallery' }, { status: 500 })
  }
}
