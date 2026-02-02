import { NextResponse } from 'next/server'
import { getWidgetByToken } from '@/lib/services/booking-widget'

export const dynamic = 'force-dynamic'

// CORS headers for embedding
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders })
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const widget = await getWidgetByToken(token)

    if (!widget || !widget.isActive) {
      return NextResponse.json(
        { error: 'Widget not found or inactive' },
        { status: 404, headers: corsHeaders }
      )
    }

    // Return public widget data (no sensitive info)
    const publicData = {
      displayName: widget.displayName || widget.tenant.bandName,
      displayBio: widget.displayBio || widget.tenant.bandBio,
      displayPhoto: widget.displayPhoto || widget.tenant.logoUrl,
      primaryColor: widget.primaryColor,
      backgroundColor: widget.backgroundColor,
      allowedEventTypes: widget.allowedEventTypes,
      minNoticeHours: widget.minNoticeHours,
      successMessage: widget.successMessage,
      tenant: {
        bandName: widget.tenant.bandName,
        website: widget.tenant.website,
        socialLinks: widget.tenant.socialLinks,
      }
    }

    return NextResponse.json(
      { success: true, data: publicData },
      { headers: corsHeaders }
    )
  } catch (error) {
    console.error('GET /api/public/widget/[token] error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch widget' },
      { status: 500, headers: corsHeaders }
    )
  }
}
