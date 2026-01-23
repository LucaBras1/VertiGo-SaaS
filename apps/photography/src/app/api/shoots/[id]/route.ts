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

    const shoot = await prisma.shoot.findFirst({
      where: {
        id: params.id,
        tenantId: session.user.tenantId
      },
      include: {
        package: {
          include: {
            client: true
          }
        },
        shotList: true,
        galleries: true
      }
    })

    if (!shoot) {
      return NextResponse.json({ error: 'Shoot not found' }, { status: 404 })
    }

    return NextResponse.json(shoot)
  } catch (error) {
    console.error('GET /api/shoots/[id] error:', error)
    return NextResponse.json({ error: 'Failed to fetch shoot' }, { status: 500 })
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

    const shoot = await prisma.shoot.findFirst({
      where: {
        id: params.id,
        tenantId: session.user.tenantId
      }
    })

    if (!shoot) {
      return NextResponse.json({ error: 'Shoot not found' }, { status: 404 })
    }

    const updated = await prisma.shoot.update({
      where: { id: params.id },
      data: {
        ...body,
        date: body.date ? new Date(body.date) : undefined,
        sunsetTime: body.sunsetTime ? new Date(body.sunsetTime) : undefined,
        updatedAt: new Date()
      },
      include: {
        package: {
          include: {
            client: true
          }
        }
      }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('PUT /api/shoots/[id] error:', error)
    return NextResponse.json({ error: 'Failed to update shoot' }, { status: 500 })
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

    const shoot = await prisma.shoot.findFirst({
      where: {
        id: params.id,
        tenantId: session.user.tenantId
      }
    })

    if (!shoot) {
      return NextResponse.json({ error: 'Shoot not found' }, { status: 404 })
    }

    await prisma.shoot.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/shoots/[id] error:', error)
    return NextResponse.json({ error: 'Failed to delete shoot' }, { status: 500 })
  }
}
