import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const galleries = await prisma.gallery.findMany({
      where: {
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
          take: 10
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(galleries)
  } catch (error) {
    console.error('GET /api/galleries error:', error)
    return NextResponse.json({ error: 'Failed to fetch galleries' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { shootId, name, password, expiresAt, downloadEnabled } = body

    if (!shootId || !name) {
      return NextResponse.json(
        { error: 'Shoot ID and name are required' },
        { status: 400 }
      )
    }

    // Verify shoot belongs to tenant
    const shoot = await prisma.shoot.findFirst({
      where: {
        id: shootId,
        tenantId: session.user.tenantId
      }
    })

    if (!shoot) {
      return NextResponse.json({ error: 'Shoot not found' }, { status: 404 })
    }

    // Generate unique public URL
    const publicUrl = `gallery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const gallery = await prisma.gallery.create({
      data: {
        shootId,
        tenantId: session.user.tenantId,
        name,
        status: 'PROCESSING',
        publicUrl,
        password,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        downloadEnabled: downloadEnabled ?? true
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
        }
      }
    })

    return NextResponse.json(gallery, { status: 201 })
  } catch (error) {
    console.error('POST /api/galleries error:', error)
    return NextResponse.json({ error: 'Failed to create gallery' }, { status: 500 })
  }
}
