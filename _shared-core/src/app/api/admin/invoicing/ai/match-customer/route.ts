/**
 * Customer Matching API
 *
 * Automaticky rozpozná zákazníka z textu nebo dokumentu.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  matchCustomerFromText,
  matchCustomerFromEmail,
  matchCustomerFromDocument,
  findCustomerByIdentifier,
  suggestCustomers,
} from '@/lib/invoicing/ai'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { text, type, senderEmail, minConfidence } = body

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }

    let matches

    switch (type) {
      case 'email':
        matches = await matchCustomerFromEmail(text, senderEmail)
        break
      case 'document':
        matches = await matchCustomerFromDocument(text)
        break
      default:
        matches = await matchCustomerFromText(text, minConfidence || 0.5)
    }

    return NextResponse.json({
      matches,
      bestMatch: matches[0] || null,
    })
  } catch (error) {
    console.error('Error matching customer:', error)
    return NextResponse.json(
      { error: 'Failed to match customer' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const identifier = searchParams.get('identifier')
    const query = searchParams.get('query')
    const limit = parseInt(searchParams.get('limit') || '5')

    // Vyhledání podle identifikátoru (IČO/DIČ)
    if (identifier) {
      const customer = await findCustomerByIdentifier(identifier)
      return NextResponse.json({ customer })
    }

    // Autocomplete suggestions
    if (query) {
      const suggestions = await suggestCustomers(query, limit)
      return NextResponse.json({ suggestions })
    }

    return NextResponse.json(
      { error: 'Either identifier or query is required' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error finding customer:', error)
    return NextResponse.json(
      { error: 'Failed to find customer' },
      { status: 500 }
    )
  }
}
