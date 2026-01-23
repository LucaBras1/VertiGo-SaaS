/**
 * Parent Communication AI API Route
 * POST /api/ai/parent-message
 */

import { NextRequest, NextResponse } from 'next/server'
import { generateParentMessage } from '@/lib/ai'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    if (!body.messageType || !body.parentName || !body.childName) {
      return NextResponse.json(
        { error: 'Missing required fields: messageType, parentName, childName' },
        { status: 400 }
      )
    }

    // Call AI
    const result = await generateParentMessage({
      messageType: body.messageType,
      partyDetails: body.partyDetails || {},
      parentName: body.parentName,
      childName: body.childName,
      context: body.context || '',
      keyPoints: body.keyPoints || [],
    })

    return NextResponse.json({
      success: true,
      data: {
        message: result,
      },
    })
  } catch (error) {
    console.error('Parent Communication AI error:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate parent message',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
