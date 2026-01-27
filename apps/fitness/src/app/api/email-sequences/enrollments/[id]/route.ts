import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const enrollment = await prisma.emailSequenceEnrollment.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
      include: {
        sequence: {
          select: {
            id: true,
            name: true,
          },
        },
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        emails: {
          orderBy: { stepOrder: 'asc' },
        },
      },
    })

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Enrollment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(enrollment)
  } catch (error) {
    console.error('Get enrollment error:', error)
    return NextResponse.json(
      { error: 'Failed to get enrollment' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const enrollment = await prisma.emailSequenceEnrollment.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
    })

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Enrollment not found' },
        { status: 404 }
      )
    }

    // Update status to unsubscribed instead of deleting
    await prisma.emailSequenceEnrollment.update({
      where: { id },
      data: {
        status: 'unsubscribed',
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unsubscribe enrollment error:', error)
    return NextResponse.json(
      { error: 'Failed to unsubscribe' },
      { status: 500 }
    )
  }
}
