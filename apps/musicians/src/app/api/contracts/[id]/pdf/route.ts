import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getContractById } from '@/lib/services/contracts'
import { renderToBuffer } from '@react-pdf/renderer'
import { ContractPDF } from '@/lib/pdf/contract-pdf'
import React from 'react'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const contract = await getContractById(id, session.user.tenantId)

    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 })
    }

    // Generate PDF
    const pdfBuffer = await renderToBuffer(
      React.createElement(ContractPDF, {
        contractNumber: contract.contractNumber,
        title: contract.title,
        language: contract.language,
        performerInfo: contract.performerInfo as any,
        clientInfo: contract.clientInfo as any,
        eventDetails: contract.eventDetails as any,
        financialTerms: contract.financialTerms as any,
        sections: contract.sections as any[],
        clauses: contract.clauses as any[],
        createdAt: contract.createdAt,
      })
    )

    // Convert Buffer to Uint8Array for NextResponse compatibility
    const pdfUint8Array = new Uint8Array(pdfBuffer)

    // Return PDF
    return new NextResponse(pdfUint8Array, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${contract.contractNumber}.pdf"`,
      },
    })
  } catch (error) {
    console.error('GET /api/contracts/[id]/pdf error:', error)
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}
