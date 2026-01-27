import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { pauseEnrollment } from '@/lib/email/sequence-processor'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const enrollment = await pauseEnrollment(id, session.user.tenantId)

    return NextResponse.json(enrollment)
  } catch (error) {
    console.error('Pause enrollment error:', error)
    const message = error instanceof Error ? error.message : 'Failed to pause enrollment'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
