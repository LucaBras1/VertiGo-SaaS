import { NextRequest, NextResponse } from 'next/server'
import {
  getContractByToken,
  signContract,
  markContractViewed,
  isContractSignable,
  type ContractWithRelations,
} from '@/lib/services/contracts'
import { sendContractSignedEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: Promise<{ token: string }>
}

// GET - Get contract for signing (public)
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { token } = await params
    const contract = await getContractByToken(token)

    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 })
    }

    // Mark as viewed if just sent
    if (contract.status === 'SENT') {
      await markContractViewed(token)
    }

    // Check if contract can be signed
    const signability = isContractSignable(contract)

    // Return contract data (without sensitive tenant info)
    return NextResponse.json({
      id: contract.id,
      title: contract.title,
      content: contract.content,
      clauses: contract.clauses,
      status: contract.status,
      expiresAt: contract.expiresAt,
      signedAt: contract.signedAt,
      signedByName: contract.signedByName,
      canSign: signability.valid,
      signabilityReason: signability.reason,
      client: contract.client
        ? {
            name: contract.client.name,
            email: contract.client.email,
          }
        : null,
      package: contract.package
        ? {
            title: contract.package.title,
            eventType: contract.package.eventType,
            eventDate: contract.package.eventDate,
          }
        : null,
      tenant: contract.tenant
        ? {
            name: contract.tenant.name,
            // Include business settings if available
            settings: contract.tenant.settings,
          }
        : null,
    })
  } catch (error) {
    console.error('GET /api/public/contracts/[token] error:', error)
    return NextResponse.json({ error: 'Failed to fetch contract' }, { status: 500 })
  }
}

// POST - Sign contract (public)
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { token } = await params
    const body = await req.json()
    const { signedByName, signedByEmail, signatureData, signatureType } = body

    if (!signedByName || !signedByEmail) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      )
    }

    if (!signatureType || !['draw', 'type', 'checkbox'].includes(signatureType)) {
      return NextResponse.json(
        { error: 'Valid signature type is required' },
        { status: 400 }
      )
    }

    // Get IP address
    const forwarded = req.headers.get('x-forwarded-for')
    const ipAddress = forwarded ? forwarded.split(',')[0].trim() : 'unknown'

    const contract = await signContract(token, {
      signedByName,
      signedByEmail,
      signatureData,
      signatureType,
      ipAddress,
    })

    // Send confirmation email
    if (contract.client?.email || signedByEmail) {
      const tenantName =
        contract.tenant && typeof contract.tenant === 'object' && 'name' in contract.tenant
          ? (contract.tenant as { name: string }).name
          : 'Your Photographer'

      await sendContractSignedEmail({
        to: contract.client?.email || signedByEmail,
        clientName: contract.signedByName || contract.client?.name || 'Client',
        contractTitle: contract.title,
        packageTitle: contract.package?.title,
        photographerName: tenantName,
      })
    }

    return NextResponse.json({
      success: true,
      signedAt: contract.signedAt,
      message: 'Contract signed successfully',
    })
  } catch (error) {
    console.error('POST /api/public/contracts/[token] error:', error)
    const message = error instanceof Error ? error.message : 'Failed to sign contract'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
