import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createCreditNote, issueCreditNote } from '@/lib/invoices/credit-note-service'
import { z } from 'zod'

const createCreditNoteSchema = z.object({
  amount: z.number().positive(),
  reason: z.string().min(1).max(500),
  notes: z.string().max(2000).optional(),
  issueImmediately: z.boolean().default(false),
})

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: invoiceId } = await params
    const body = await request.json()

    const result = createCreditNoteSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: result.error.flatten() },
        { status: 400 }
      )
    }

    const { amount, reason, notes, issueImmediately } = result.data

    let creditNote = await createCreditNote({
      tenantId: session.user.tenantId,
      invoiceId,
      amount,
      reason,
      notes,
    })

    if (issueImmediately) {
      creditNote = await issueCreditNote(creditNote.id, session.user.tenantId)
    }

    return NextResponse.json(creditNote, { status: 201 })
  } catch (error) {
    console.error('Credit note creation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create credit note' },
      { status: 500 }
    )
  }
}
