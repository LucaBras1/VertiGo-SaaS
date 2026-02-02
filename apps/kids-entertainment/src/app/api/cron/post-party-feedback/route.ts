/**
 * Post-Party Feedback Cron Job
 * GET /api/cron/post-party-feedback - Send feedback emails to parties completed yesterday
 *
 * Should be triggered daily via external cron service (e.g., Vercel Cron, GitHub Actions)
 * Protected by CRON_SECRET environment variable
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPostPartyFeedbackEmail } from '@/lib/email'

// Type for party with included relations
interface PartyWithRelations {
  id: string
  date: Date
  childName: string | null
  parentName: string | null
  parentEmail: string | null
  photosUrl: string | null
  feedbackSentAt: Date | null
  package: { title: string } | null
  orders: Array<{
    id: string
    customer: {
      email: string
      firstName: string
      lastName: string
    } | null
  }>
}

export async function GET(request: NextRequest) {
  // Verify CRON_SECRET
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    console.error('CRON_SECRET is not configured')
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 })
  }

  const providedSecret = authHeader?.replace('Bearer ', '')
  if (providedSecret !== cronSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Find completed parties from yesterday
    const now = new Date()
    const yesterdayStart = new Date(now)
    yesterdayStart.setDate(yesterdayStart.getDate() - 1)
    yesterdayStart.setHours(0, 0, 0, 0)

    const yesterdayEnd = new Date(now)
    yesterdayEnd.setDate(yesterdayEnd.getDate() - 1)
    yesterdayEnd.setHours(23, 59, 59, 999)

    // Find parties that:
    // 1. Date was yesterday
    // 2. Status is 'completed' or 'confirmed' (party happened)
    // 3. feedbackSentAt is null (feedback not yet sent)
    const partiesToFeedback = await (prisma.party.findMany as any)({
      where: {
        status: { in: ['completed', 'confirmed'] },
        date: {
          gte: yesterdayStart,
          lte: yesterdayEnd,
        },
        feedbackSentAt: null,
      },
      include: {
        package: { select: { title: true } },
        orders: {
          where: { status: { in: ['confirmed', 'completed'] } },
          include: { customer: true },
          take: 1,
        },
      },
    }) as PartyWithRelations[]

    console.log(`Found ${partiesToFeedback.length} parties to send feedback emails`)

    const results = {
      sent: 0,
      errors: 0,
      skipped: 0,
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://partypal.cz'

    for (const party of partiesToFeedback) {
      try {
        // Get customer email from linked order
        const order = party.orders[0]
        const customer = order?.customer

        // Skip if no customer or email
        if (!customer?.email) {
          console.warn(`No customer email for party ${party.id}`)
          results.skipped++
          continue
        }

        // Get parent contact from party or customer
        const parentName =
          party.parentName ||
          `${customer.firstName} ${customer.lastName}` ||
          'Vazeny zakazniku'
        const parentEmail = party.parentEmail || customer.email

        // Format party date
        const partyDate = party.date.toLocaleDateString('cs-CZ', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })

        // Build feedback URL (could be a form page)
        const feedbackUrl = `${baseUrl}/feedback/${party.id}`

        // Send feedback email
        const result = await sendPostPartyFeedbackEmail({
          to: parentEmail,
          parentName,
          childName: party.childName || 'Vašeho dítěte',
          partyDate,
          feedbackUrl,
          photoGalleryUrl: party.photosUrl || undefined,
        })

        if (result.success) {
          // Update feedbackSentAt
          await (prisma.party.update as any)({
            where: { id: party.id },
            data: { feedbackSentAt: new Date() },
          })
          results.sent++
          console.log(`Feedback email sent for party ${party.id}`)
        } else {
          console.error(`Failed to send feedback email for party ${party.id}:`, result.error)
          results.errors++
        }
      } catch (error) {
        console.error(`Error processing party ${party.id}:`, error)
        results.errors++
      }
    }

    return NextResponse.json({
      success: true,
      results,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      {
        error: 'Cron job failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
