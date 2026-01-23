/**
 * API Endpoint: ARES Lookup
 * GET /api/ares/lookup?ico=12345678
 * Lookup company information from Czech Business Register by IČO
 */

import { NextRequest, NextResponse } from 'next/server'
import { lookupCompanyByIco, validateIco } from '@/lib/aresClient'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const ico = searchParams.get('ico')

    if (!ico) {
      return NextResponse.json(
        { error: 'IČO je povinné' },
        { status: 400 }
      )
    }

    // Validate IČO format
    if (!validateIco(ico)) {
      return NextResponse.json(
        { error: 'IČO musí mít 8 číslic' },
        { status: 400 }
      )
    }

    // Lookup company info from ARES
    const companyInfo = await lookupCompanyByIco(ico)

    if (!companyInfo) {
      return NextResponse.json(
        { error: 'Firma s tímto IČO nebyla nalezena v registru ARES' },
        { status: 404 }
      )
    }

    if (!companyInfo.isActive) {
      return NextResponse.json(
        {
          ...companyInfo,
          warning: 'Firma je v registru ARES označena jako zaniklá',
        },
        { status: 200 }
      )
    }

    return NextResponse.json(companyInfo, { status: 200 })
  } catch (error) {
    console.error('Error in ARES lookup:', error)

    // Check if error message is user-friendly
    if (error instanceof Error && error.message.includes('IČO')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Chyba při komunikaci s registrem ARES. Zkuste to prosím později.' },
      { status: 500 }
    )
  }
}
