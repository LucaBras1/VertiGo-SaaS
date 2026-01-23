/**
 * Admin Message Detail API
 * GET /api/admin/messages/[id] - Get single message
 * PATCH /api/admin/messages/[id] - Update message status
 * DELETE /api/admin/messages/[id] - Delete message
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    const message = await prisma.contactMessage.findUnique({
      where: { id },
    })

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Message not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: message,
    })
  } catch (error) {
    console.error('Error fetching message:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch message' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()

    // Validate status
    const validStatuses = ['received', 'email_sent', 'email_failed', 'read', 'replied']
    if (body.status && !validStatuses.includes(body.status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      )
    }

    // Build update data
    const updateData: any = {}

    if (body.status) {
      updateData.status = body.status

      // Set timestamps based on status
      if (body.status === 'read') {
        updateData.readAt = new Date()
        updateData.readBy = session.user?.email || 'admin'
      } else if (body.status === 'replied') {
        updateData.repliedAt = new Date()
        updateData.repliedBy = session.user?.email || 'admin'
      }
    }

    if (body.notes !== undefined) {
      updateData.notes = body.notes
    }

    const message = await prisma.contactMessage.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      data: message,
    })
  } catch (error) {
    console.error('Error updating message:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update message' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    await prisma.contactMessage.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Message deleted',
    })
  } catch (error) {
    console.error('Error deleting message:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete message' },
      { status: 500 }
    )
  }
}
