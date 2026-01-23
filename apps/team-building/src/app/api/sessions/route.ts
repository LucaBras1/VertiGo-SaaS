/**
 * API Route: /api/sessions
 * Handles CRUD operations for Sessions
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

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
        customerId: customerId || null,
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

    return NextResponse.json({ success: true, data: session }, { status: 201 })
  } catch (error) {
    console.error('Error creating session:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create session' },
      { status: 500 }
    )
  }
}
