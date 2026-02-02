/**
 * API Route: /api/sessions
 * Handles CRUD operations for Sessions
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendSessionConfirmationEmail } from '@/lib/email'
import { format } from 'date-fns'
import { syncSessionToCalendars } from '@/lib/calendar'

/**
 * GET /api/sessions
 * List all sessions with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const programId = searchParams.get('programId')

    const where: any = {}
    if (status) where.status = status
    if (programId) where.programId = programId

    const sessions = await prisma.session.findMany({
      where,
      orderBy: { date: 'desc' },
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

    return NextResponse.json({ success: true, data: sessions })
  } catch (error) {
    console.error('Error fetching sessions:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sessions' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/sessions
 * Create a new session
 */
export async function POST(request: NextRequest) {
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
      // Email notification fields (optional)
      sendConfirmation,
      contactEmail,
      contactName,
    } = body

    // Validate required fields
    if (!programId || !date || !venue?.name) {
      return NextResponse.json(
        { success: false, error: 'Program, date, and venue name are required' },
        { status: 400 }
      )
    }

    // Create session
    const session = await prisma.session.create({
      data: {
        programId,
        // customerId removed - field doesn't exist in Session model
        date: new Date(date),
        endDate: endDate ? new Date(endDate) : null,
        venue,
        teamSize,
        teamName,
        companyName,
        industryType,
        objectives,
        customObjectives,
        status: status || 'confirmed',
        isPublic: isPublic || false,
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

    // Send confirmation email if requested
    if (sendConfirmation && contactEmail) {
      const sessionDate = new Date(date)
      const objectivesList = Array.isArray(objectives) ? objectives : []

      await sendSessionConfirmationEmail({
        to: contactEmail,
        contactName: contactName || 'Team',
        companyName: companyName || 'Your Company',
        programTitle: session.program?.title || 'Team Building Session',
        sessionDate: format(sessionDate, 'MMMM d, yyyy'),
        sessionTime: format(sessionDate, 'h:mm a'),
        venue: venue?.name || 'TBD',
        teamSize: teamSize || 0,
        objectives: objectivesList,
      }).catch((err) => {
        console.error('Failed to send confirmation email:', err)
        // Don't fail the request if email fails
      })
    }

    // Sync to connected calendars (async, don't block response)
    syncSessionToCalendars(session.id).catch((err) => {
      console.error('Failed to sync session to calendars:', err)
    })

    return NextResponse.json({ success: true, data: session }, { status: 201 })
  } catch (error) {
    console.error('Error creating session:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create session' },
      { status: 500 }
    )
  }
}
