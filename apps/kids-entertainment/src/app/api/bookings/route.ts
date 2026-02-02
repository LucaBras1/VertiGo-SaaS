/**
 * Bookings API Route
 * POST /api/bookings - Create new booking (party + order)
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function generateOrderNumber() {
  const date = new Date()
  const year = date.getFullYear().toString().slice(-2)
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `PP${year}${month}-${random}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      packageId,
      activityIds,
      partyDetails,
      childInfo,
      contact,
      safetyAcknowledged,
    } = body

    // Validate required fields
    if (!partyDetails || !childInfo || !contact) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!packageId && (!activityIds || activityIds.length === 0)) {
      return NextResponse.json(
        { error: 'Select a package or at least one activity' },
        { status: 400 }
      )
    }

    // Find or create customer
    let customer = await prisma.customer.findUnique({
      where: { email: contact.parentEmail },
    })

    if (!customer) {
      const nameParts = contact.parentName.split(' ')
      customer = await prisma.customer.create({
        data: {
          email: contact.parentEmail,
          firstName: nameParts[0] || contact.parentName,
          lastName: nameParts.slice(1).join(' ') || '',
          phone: contact.parentPhone,
          children: [
            {
              name: childInfo.name,
              age: childInfo.age,
              interests: childInfo.interests || '',
              allergies: childInfo.allergies || [],
            },
          ],
        },
      })
    }

    // Create party date
    const partyDate = new Date(`${partyDetails.date}T${partyDetails.startTime}:00`)

    // Get package duration or calculate from activities
    let duration = 180 // default 3 hours
    if (packageId) {
      const pkg = await prisma.package.findUnique({
        where: { id: packageId },
        select: { duration: true },
      })
      if (pkg) duration = pkg.duration
    } else if (activityIds && activityIds.length > 0) {
      const activities = await prisma.activity.findMany({
        where: { id: { in: activityIds } },
        select: { duration: true },
      })
      duration = activities.reduce((sum, a) => sum + a.duration, 0)
    }

    const endDate = new Date(partyDate.getTime() + duration * 60 * 1000)

    // Create Party
    const party = await prisma.party.create({
      data: {
        packageId: packageId || null,
        activityId: activityIds?.[0] || null, // Link first activity if custom
        date: partyDate,
        endDate,
        venue: partyDetails.venue,
        childName: childInfo.name,
        childAge: childInfo.age,
        childGender: childInfo.gender,
        childInterests: childInfo.interests?.split(',').map((i: string) => i.trim()).filter(Boolean) || [],
        guestCount: partyDetails.guestCount,
        theme: packageId ? undefined : 'Vlastní program',
        specialRequests: partyDetails.specialRequests,
        allergies: childInfo.allergies || [],
        dietaryRestrictions: childInfo.dietaryRestrictions || [],
        specialNeeds: childInfo.specialNeeds,
        emergencyContact: contact.emergencyContact,
        parentName: contact.parentName,
        parentPhone: contact.parentPhone,
        parentEmail: contact.parentEmail,
        status: 'inquiry',
      },
    })

    // Get prices
    let items: { date: string; price: number; packageId?: string; activityId?: string }[] = []

    if (packageId) {
      const pkg = await prisma.package.findUnique({
        where: { id: packageId },
        select: { price: true },
      })
      items.push({
        date: partyDetails.date,
        price: pkg?.price || 0,
        packageId,
      })
    } else if (activityIds && activityIds.length > 0) {
      const activities = await prisma.activity.findMany({
        where: { id: { in: activityIds } },
        select: { id: true, price: true },
      })
      items = activities.map((a) => ({
        date: partyDetails.date,
        price: a.price || 0,
        activityId: a.id,
      }))
    }

    const totalPrice = items.reduce((sum, item) => sum + item.price, 0)

    // Create Order
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        customerId: customer.id,
        source: 'website',
        status: 'new',
        partyName: `${childInfo.name} - ${childInfo.age}. narozeniny`,
        dates: {
          date: partyDetails.date,
          startTime: partyDetails.startTime,
          duration,
        },
        venue: partyDetails.venue,
        guestCount: partyDetails.guestCount,
        childInfo: {
          name: childInfo.name,
          age: childInfo.age,
          gender: childInfo.gender,
          interests: childInfo.interests,
          allergies: childInfo.allergies,
        },
        specialRequests: partyDetails.specialRequests,
        allergyNotes: childInfo.allergies?.join(', '),
        pricing: {
          subtotal: totalPrice,
          total: totalPrice,
          deposit: Math.round(totalPrice * 0.3),
        },
        contacts: {
          parent: {
            name: contact.parentName,
            phone: contact.parentPhone,
            email: contact.parentEmail,
          },
          emergency: contact.emergencyContact,
        },
        linkedPartyId: party.id,
        items: {
          create: items.map((item) => ({
            date: item.date,
            price: item.price,
            packageId: item.packageId,
            activityId: item.activityId,
          })),
        },
      },
      include: {
        items: true,
      },
    })

    // Create Safety Checklist
    await prisma.safetyChecklist.create({
      data: {
        partyId: party.id,
        orderId: order.id,
        allergyReview: false,
        emergencyContacts: true, // They provided it
        venueAssessment: false,
        equipmentCheck: false,
        staffBriefing: false,
        notes: {
          createdAt: new Date().toISOString(),
          safetyAcknowledged,
          allergies: childInfo.allergies || [],
          specialNeeds: childInfo.specialNeeds || null,
        },
      },
    })

    // Update customer stats
    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        totalPartiesBooked: { increment: 1 },
        lastPartyDate: partyDate,
      },
    })

    return NextResponse.json(
      {
        success: true,
        orderId: order.id,
        orderNumber: order.orderNumber,
        partyId: party.id,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}
