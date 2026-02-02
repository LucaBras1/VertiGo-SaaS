/**
 * Email Sequence Enrollment API
 * POST /api/email-sequences/[id]/enroll - Enroll customer(s)
 */

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { enrollCustomer, unenrollCustomer } from '@/lib/email-sequences'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: sequenceId } = await context.params
    const body = await request.json()
    const { customerId, customerIds, action = 'enroll', skipFirstDelay = false } = body

    const ids = customerIds || (customerId ? [customerId] : [])

    if (ids.length === 0) {
      return NextResponse.json({ error: 'Customer ID(s) required' }, { status: 400 })
    }

    const results = []

    for (const cId of ids) {
      if (action === 'unenroll') {
        const success = await unenrollCustomer(cId, sequenceId)
        results.push({ customerId: cId, success, action: 'unenroll' })
      } else {
        const result = await enrollCustomer(cId, sequenceId, skipFirstDelay)
        results.push({ customerId: cId, ...result, action: 'enroll' })
      }
    }

    const successCount = results.filter((r) => r.success).length
    const failCount = results.length - successCount

    return NextResponse.json({
      success: failCount === 0,
      total: results.length,
      successCount,
      failCount,
      results,
    })
  } catch (error) {
    console.error('Error enrolling customers:', error)
    return NextResponse.json({ error: 'Failed to enroll customers' }, { status: 500 })
  }
}
