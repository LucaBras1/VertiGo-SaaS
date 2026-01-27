import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getGigById } from '@/lib/services/gigs'
import { generateStageRider, StageRiderInput } from '@/lib/ai/stage-rider-generator'
import { renderToBuffer } from '@react-pdf/renderer'
import { StageRiderPDF } from '@/lib/pdf/stage-rider-pdf'
import { prisma } from '@/lib/db'
import React from 'react'

interface Venue {
  name?: string
  address?: string
  city?: string
  type?: string
}

function mapVenueType(venue?: Venue): 'club' | 'theater' | 'outdoor' | 'corporate' | 'restaurant' | 'festival' {
  if (!venue?.type) return 'club'

  const type = venue.type.toLowerCase()
  if (type === 'outdoor') return 'outdoor'
  if (type.includes('theater') || type.includes('theatre')) return 'theater'
  if (type.includes('restaurant') || type.includes('cafe')) return 'restaurant'
  if (type.includes('corporate') || type.includes('conference')) return 'corporate'
  if (type.includes('festival')) return 'festival'

  return 'club'
}

function estimateInstruments(bandMembers: number): StageRiderInput['instruments'] {
  // Default band configuration based on size
  const instruments: StageRiderInput['instruments'] = []

  if (bandMembers >= 1) {
    instruments.push({ type: 'vocals', quantity: 1 })
  }
  if (bandMembers >= 2) {
    instruments.push({ type: 'guitar', quantity: 1 })
  }
  if (bandMembers >= 3) {
    instruments.push({ type: 'bass', quantity: 1 })
  }
  if (bandMembers >= 4) {
    instruments.push({ type: 'drums', quantity: 1 })
  }
  if (bandMembers >= 5) {
    instruments.push({ type: 'keys', quantity: 1 })
  }
  if (bandMembers >= 6) {
    instruments.push({ type: 'vocals', quantity: 1, notes: 'Backing vocals' })
  }
  if (bandMembers >= 7) {
    instruments.push({ type: 'guitar', quantity: 1, notes: 'Second guitar' })
  }
  if (bandMembers >= 8) {
    instruments.push({ type: 'sax', quantity: 1 })
  }

  return instruments
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Fetch gig details
    const gig = await getGigById(id, session.user.tenantId)
    if (!gig) {
      return NextResponse.json({ error: 'Gig not found' }, { status: 404 })
    }

    // Fetch tenant details
    const tenant = await prisma.tenant.findUnique({
      where: { id: session.user.tenantId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        bandName: true,
        settings: true,
      },
    })

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    // Parse venue from gig
    const venue = gig.venue as Venue | undefined

    // Build stage rider input from gig data
    const stageRiderInput: StageRiderInput = {
      bandName: tenant.bandName || tenant.name,
      bandSize: gig.bandMembers || 4,
      instruments: estimateInstruments(gig.bandMembers || 4),
      venueType: mapVenueType(venue),
      hasOwnPA: false, // Default - could be stored in gig settings
      hasBackline: false, // Default - could be stored in gig settings
      eventDuration: gig.eventDuration || undefined,
      specialRequirements: [],
    }

    // Generate stage rider using AI or template
    const stageRider = await generateStageRider(stageRiderInput, {
      tenantId: session.user.tenantId,
      contactInfo: {
        name: tenant.name,
        phone: tenant.phone,
        email: tenant.email,
      },
    })

    // Add gig-specific info to the rider
    const riderData = {
      ...stageRider,
      generatedDate: new Date().toISOString(),
    }

    // Generate PDF buffer
    const pdfBuffer = await renderToBuffer(React.createElement(StageRiderPDF, { data: riderData }) as any)

    // Create filename
    const safeBandName = (tenant.bandName || tenant.name).replace(/[^a-zA-Z0-9]/g, '-')
    const safeGigTitle = gig.title.replace(/[^a-zA-Z0-9]/g, '-')
    const filename = `stage-rider-${safeBandName}-${safeGigTitle}.pdf`

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error) {
    console.error('GET /api/gigs/[id]/stage-rider/pdf error:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// Also support POST for custom rider parameters
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    // Fetch gig details for context
    const gig = await getGigById(id, session.user.tenantId)
    if (!gig) {
      return NextResponse.json({ error: 'Gig not found' }, { status: 404 })
    }

    // Fetch tenant details
    const tenant = await prisma.tenant.findUnique({
      where: { id: session.user.tenantId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        bandName: true,
      },
    })

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    // Use provided input or defaults from gig
    const stageRiderInput: StageRiderInput = {
      bandName: body.bandName || tenant.bandName || tenant.name,
      bandSize: body.bandSize || gig.bandMembers || 4,
      instruments: body.instruments || estimateInstruments(gig.bandMembers || 4),
      venueType: body.venueType || 'club',
      hasOwnPA: body.hasOwnPA ?? false,
      hasBackline: body.hasBackline ?? false,
      eventDuration: body.eventDuration || gig.eventDuration || undefined,
      specialRequirements: body.specialRequirements || [],
    }

    // Generate stage rider
    const stageRider = await generateStageRider(stageRiderInput, {
      tenantId: session.user.tenantId,
      contactInfo: {
        name: body.contactName || tenant.name,
        phone: body.contactPhone || tenant.phone,
        email: body.contactEmail || tenant.email,
      },
    })

    // Add metadata
    const riderData = {
      ...stageRider,
      generatedDate: new Date().toISOString(),
    }

    // Generate PDF buffer
    const pdfBuffer = await renderToBuffer(React.createElement(StageRiderPDF, { data: riderData }) as any)

    // Create filename
    const safeBandName = stageRiderInput.bandName.replace(/[^a-zA-Z0-9]/g, '-')
    const safeGigTitle = gig.title.replace(/[^a-zA-Z0-9]/g, '-')
    const filename = `stage-rider-${safeBandName}-${safeGigTitle}.pdf`

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error) {
    console.error('POST /api/gigs/[id]/stage-rider/pdf error:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
