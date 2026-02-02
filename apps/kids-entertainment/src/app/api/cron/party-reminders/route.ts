/**
 * Party Reminder Cron Job
 * GET /api/cron/party-reminders - Send 24h party reminder emails
 *
 * Should be triggered daily via external cron service (e.g., Vercel Cron, GitHub Actions)
 * Protected by CRON_SECRET environment variable
 *
 * NOTE: Requires running `prisma generate` after adding reminderSentAt field
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPartyReminderEmail } from '@/lib/email'

// Type for party with included relations
interface PartyWithRelations {
  id: string
  date: Date
  childName: string | null
  parentName: string | null
  parentEmail: string | null
  venue: unknown
  allergies: string[]
  emergencyContact: unknown
  reminderSentAt: Date | null
  package: { title: string } | null
  orders: Array<{
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
    // Find confirmed parties within the next 24-hour window
    const now = new Date()
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)

    // Find parties that are:
    // 1. Status is 'confirmed'
    // 2. Date is within next 24 hours
    // 3. reminderSentAt is null (reminder not yet sent)
    // Note: Using type assertion since reminderSentAt is newly added field
    const partiesToRemind = await (prisma.party.findMany as any)({
      where: {
        status: 'confirmed',
        date: {
          gte: now,
          lte: tomorrow,
        },
        reminderSentAt: null,
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

    console.log(`Found ${partiesToRemind.length} parties to send reminders`)

    const results = {
      sent: 0,
      errors: 0,
      skipped: 0,
    }

    for (const party of partiesToRemind) {
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

        // Format party date and time
        const partyDate = party.date.toLocaleDateString('cs-CZ', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
        const partyTime = party.date.toLocaleTimeString('cs-CZ', {
          hour: '2-digit',
          minute: '2-digit',
        })

        // Get venue info
        const venueData = party.venue as Record<string, string> | null
        const venue = venueData
          ? `${venueData.name || ''}, ${venueData.address || ''}`
          : 'Misto bude upřesneno'

        // Get allergy notes
        const allergyNotes =
          party.allergies && party.allergies.length > 0
            ? `Zname alergie: ${party.allergies.join(', ')}`
            : undefined

        // Get emergency contact
        const emergencyData = party.emergencyContact as Record<string, string> | null
        const emergencyContact = emergencyData
          ? { name: emergencyData.name || '', phone: emergencyData.phone || '' }
          : undefined

        // Send reminder email
        const result = await sendPartyReminderEmail({
          to: parentEmail,
          parentName,
          childName: party.childName || 'Vašeho dítěte',
          partyDate,
          partyTime,
          venue,
          packageName: party.package?.title || 'Detská oslava',
          allergyNotes,
          emergencyContact,
        })

        if (result.success) {
          // Update reminderSentAt (using type assertion for new field)
          await (prisma.party.update as any)({
            where: { id: party.id },
            data: { reminderSentAt: new Date() },
          })
          results.sent++
          console.log(`Reminder sent for party ${party.id}`)
        } else {
          console.error(`Failed to send reminder for party ${party.id}:`, result.error)
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
