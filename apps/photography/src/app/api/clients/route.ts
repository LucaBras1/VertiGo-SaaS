import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getClients, createClient as createClientService } from '@/lib/services/clients'

// Force dynamic to avoid build-time Prisma proxy issues
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse query params
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || undefined
    const type = searchParams.get('type') as 'individual' | 'couple' | 'business' | undefined
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const sortBy = (searchParams.get('sortBy') || 'createdAt') as 'createdAt' | 'name' | 'email'
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc'

    const result = await getClients(session.user.tenantId, {
      search,
      type,
      page,
      limit,
      sortBy,
      sortOrder,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('GET /api/clients error:', error)
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name, email, phone, address, type, tags, notes } = body

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      )
    }

    const client = await createClientService({
      tenantId: session.user.tenantId,
      name,
      email,
      phone,
      address,
      type,
      tags,
      notes,
    })

    return NextResponse.json(client, { status: 201 })
  } catch (error) {
    console.error('POST /api/clients error:', error)
    const message = error instanceof Error ? error.message : 'Failed to create client'
    const status = message.includes('already exists') ? 400 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
