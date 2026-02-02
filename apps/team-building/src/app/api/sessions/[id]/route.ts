/**
 * API Route: /api/sessions/[id]
 * Handles individual session operations
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { syncSessionToCalendars, deleteSessionFromCalendars } from '@/lib/calendar'
import { onSessionCompleted } from '@/lib/email-sequences'

/**
 * GET /api/sessions/[id]
 * Get a single session by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await prisma.session.findUnique({
      where: { id: params.id },
      include: {
        program: {
          select: {
            id: true,
            title: true,
            duration: true,
            objectives: true,
          },
        },
      },
    })

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: session })
  } catch (error) {
    console.error('Error fetching session:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch session' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/sessions/[id]
 * Update a session
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    const {
      programId,
      customerId,
      date,
      endDate,
      venue,
      teamSize,
      teamName,
      companyName,
      industryType,
      objectives,
      customObjectives,
      status,
      isPublic,
      notes,
    } = body

    // Get old session to check status change
    const oldSession = await prisma.session.findUnique({
      where: { id: params.id },
      select: { status: true },
    })

    // Update session
    const session = await prisma.session.update({
      where: { id: params.id },
      data: {
        programId,
        // customerId removed - field doesn't exist in Session model
        date: date ? new Date(date) : undefined,
        endDate: endDate ? new Date(endDate) : null,
        venue,
        teamSize,
        teamName,
        companyName,
        industryType,
        objectives,
        customObjectives,
        status,
        isPublic,
        notes,
      },
      include: {
        program: {
          select: {
            id: true,
            title: true,
            duration: true,
          },
        },
      },
    })

    // Check if session was marked as completed
    if (status === 'completed' && oldSession?.status !== 'completed') {
      // Trigger email sequence enrollment
      onSessionCompleted(params.id).catch((err) => {
        console.error('Failed to trigger session completed email sequence:', err)
      })
    }

    // Sync to connected calendars (async, don't block response)
    if (status !== 'cancelled') {
      syncSessionToCalendars(session.id).catch((err) => {
        console.error('Failed to sync session to calendars:', err)
      })
    } else {
      // If cancelled, delete from calendars
      deleteSessionFromCalendars(session.id).catch((err) => {
        console.error('Failed to delete session from calendars:', err)
      })
    }

    return NextResponse.json({ success: true, data: session })
  } catch (error) {
    console.error('Error updating session:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update session' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/sessions/[id]
 * Delete a session
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Delete from calendars first
    await deleteSessionFromCalendars(params.id).catch((err) => {
      console.error('Failed to delete session from calendars:', err)
    })

    await prisma.session.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting session:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete session' },
      { status: 500 }
    )
  }
}
