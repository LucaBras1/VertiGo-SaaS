import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { enrollClientInSequence } from '@/lib/email/sequence-processor'
import { z } from 'zod'

const enrollSchema = z.object({
  clientId: z.string().min(1),
})

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: sequenceId } = await params
    const body = await request.json()

    const result = enrollSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: result.error.flatten() },
        { status: 400 }
      )
    }

    // Verify sequence belongs to tenant
    const sequence = await prisma.emailSequence.findFirst({
      where: {
        id: sequenceId,
        tenantId: session.user.tenantId,
      },
    })

    if (!sequence) {
      return NextResponse.json(
        { error: 'Sequence not found' },
        { status: 404 }
      )
    }

    // Verify client belongs to tenant
    const client = await prisma.client.findFirst({
      where: {
        id: result.data.clientId,
        tenantId: session.user.tenantId,
      },
    })

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      )
    }

    const enrollResult = await enrollClientInSequence({
      sequenceId,
      clientId: result.data.clientId,
      tenantId: session.user.tenantId,
    })

    if (!enrollResult.success) {
      return NextResponse.json(
        { error: enrollResult.error },
        { status: 400 }
      )
    }

    // Fetch the enrollment with details
    const enrollment = await prisma.emailSequenceEnrollment.findUnique({
      where: { id: enrollResult.enrollmentId },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(enrollment, { status: 201 })
  } catch (error) {
    console.error('Email sequence enroll error:', error)
    return NextResponse.json(
      { error: 'Failed to enroll client' },
      { status: 500 }
    )
  }
}
