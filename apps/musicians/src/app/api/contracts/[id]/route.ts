import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getContractById, updateContract, deleteContract, duplicateContract } from '@/lib/services/contracts'
import { ContractStatus, ContractLanguage } from '@/generated/prisma'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const updateContractSchema = z.object({
  title: z.string().optional(),
  status: z.enum(['DRAFT', 'SENT', 'SIGNED', 'ACTIVE', 'COMPLETED', 'CANCELLED']).optional(),
  language: z.enum(['CS', 'EN']).optional(),
  performerInfo: z.object({
    name: z.string(),
    address: z.string().optional(),
    ico: z.string().optional(),
    dic: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
  }).optional(),
  clientInfo: z.object({
    name: z.string(),
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
    company: z.string().optional(),
  }).optional(),
  eventDetails: z.object({
    title: z.string(),
    date: z.string(),
    time: z.string().optional(),
    venue: z.string().optional(),
    duration: z.number().optional(),
    description: z.string().optional(),
  }).optional(),
  financialTerms: z.object({
    totalPrice: z.number(),
    deposit: z.number().optional(),
    depositDue: z.string().optional(),
    paymentDue: z.string().optional(),
    currency: z.string(),
  }).optional(),
  sections: z.array(z.object({
    id: z.string(),
    title: z.string(),
    content: z.string(),
    order: z.number(),
  })).optional(),
  clauses: z.array(z.object({
    clauseId: z.string(),
    title: z.string(),
    content: z.string(),
    order: z.number(),
  })).optional(),
  pdfUrl: z.string().optional(),
})

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

    return NextResponse.json({ success: true, data: contract })
  } catch (error) {
    console.error('GET /api/contracts/[id] error:', error)
    return NextResponse.json({ error: 'Failed to fetch contract' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const validated = updateContractSchema.parse(body)

    const contract = await updateContract(id, session.user.tenantId, {
      ...validated,
      status: validated.status as ContractStatus | undefined,
      language: validated.language as ContractLanguage | undefined,
    })

    return NextResponse.json({ success: true, data: contract })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    if (error instanceof Error && error.message === 'Contract not found') {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 })
    }
    console.error('PUT /api/contracts/[id] error:', error)
    return NextResponse.json({ error: 'Failed to update contract' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    await deleteContract(id, session.user.tenantId)

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message === 'Contract not found') {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 })
    }
    console.error('DELETE /api/contracts/[id] error:', error)
    return NextResponse.json({ error: 'Failed to delete contract' }, { status: 500 })
  }
}
