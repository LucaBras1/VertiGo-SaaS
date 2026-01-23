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

    const shotList = await prisma.shotList.findFirst({
      where: {
        id: params.id,
        tenantId: session.user.tenantId
      },
      include: {
        package: {
          include: {
            client: true
          }
        }
      }
    })

    if (!shotList) {
      return NextResponse.json({ error: 'Shot list not found' }, { status: 404 })
    }

    return NextResponse.json(shotList)
  } catch (error) {
    console.error('GET /api/shot-lists/[id] error:', error)
    return NextResponse.json({ error: 'Failed to fetch shot list' }, { status: 500 })
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

    const shotList = await prisma.shotList.findFirst({
      where: {
        id: params.id,
        tenantId: session.user.tenantId
      }
    })

    if (!shotList) {
      return NextResponse.json({ error: 'Shot list not found' }, { status: 404 })
    }

    const updated = await prisma.shotList.update({
      where: { id: params.id },
      data: {
        ...body,
        updatedAt: new Date()
      }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('PUT /api/shot-lists/[id] error:', error)
    return NextResponse.json({ error: 'Failed to update shot list' }, { status: 500 })
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

    const shotList = await prisma.shotList.findFirst({
      where: {
        id: params.id,
        tenantId: session.user.tenantId
      }
    })

    if (!shotList) {
      return NextResponse.json({ error: 'Shot list not found' }, { status: 404 })
    }

    await prisma.shotList.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/shot-lists/[id] error:', error)
    return NextResponse.json({ error: 'Failed to delete shot list' }, { status: 500 })
  }
}
