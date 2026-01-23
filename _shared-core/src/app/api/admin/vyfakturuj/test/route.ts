/**
 * Vyfakturuj API Test Connection Route
 *
 * POST /api/admin/vyfakturuj/test - Test connection with provided credentials
 */

import { NextRequest, NextResponse } from 'next/server'
import { VyfakturujClient } from '@/lib/vyfakturuj/client'

// POST /api/admin/vyfakturuj/test - Test API connection
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const { email, apiKey } = data

    if (!email || !apiKey) {
      return NextResponse.json(
        { error: 'Email and API key are required' },
        { status: 400 }
      )
    }

    // Create temporary client with provided credentials
    const client = new VyfakturujClient(email, apiKey)
    const result = await client.test()

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Spojení s Vyfakturuj.cz je funkční',
        email: result.email,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.message || 'Nepodařilo se připojit k Vyfakturuj.cz',
        },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error testing Vyfakturuj connection:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Test spojení selhal',
      },
      { status: 500 }
    )
  }
}
