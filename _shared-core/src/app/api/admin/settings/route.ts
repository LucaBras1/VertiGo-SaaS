/**
 * Settings API Routes
 *
 * Settings is a singleton - only one record exists
 * GET /api/admin/settings - Get the settings
 * PUT /api/admin/settings - Update the settings
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/settings - Get settings (singleton)
export async function GET() {
  try {
    // Get the first (and only) settings record
    let settings = await prisma.settings.findFirst()

    // If no settings exist, create default settings
    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          siteTitle: 'Divadlo Studna',
          siteDescription: 'Divadlo pro děti a mládež',
          contactEmail: '',
          contactPhone: '',
          address: undefined,
          socialLinks: undefined,
          defaultSeo: undefined,
        },
      })
    }

    return NextResponse.json({ data: settings }, { status: 200 })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

// PUT /api/admin/settings - Update settings (singleton)
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()

    // Validate required fields
    if (!data.siteTitle) {
      return NextResponse.json({ error: 'Site title is required' }, { status: 400 })
    }

    // Get the first settings record
    let settings = await prisma.settings.findFirst()

    // Prepare common data object
    // Use null for empty values to explicitly clear them, not undefined (which means "don't update")
    const settingsData = {
      siteTitle: data.siteTitle,
      siteDescription: data.siteDescription || '',
      contactEmail: data.contactEmail || null,
      contactPhone: data.contactPhone || null,
      address: data.address || null,
      socialLinks: data.socialLinks || null,
      defaultSeo: data.defaultSeo || null,
      // SMTP Email Configuration
      smtpHost: data.smtpHost || null,
      smtpPort: data.smtpPort ?? null,
      smtpSecure: data.smtpSecure ?? false,
      smtpUser: data.smtpUser || null,
      smtpPassword: data.smtpPassword || null,
      emailFrom: data.emailFrom || null,
      emailTo: data.emailTo || null,
      // Contact Form Copy Settings
      contactFormCopyEnabled: data.contactFormCopyEnabled ?? true,
      contactFormCopyEmail: data.contactFormCopyEmail || null,
      // Email Template Settings
      offerEmailSubject: data.offerEmailSubject || null,
      offerEmailGreeting: data.offerEmailGreeting || null,
      offerEmailIntro: data.offerEmailIntro || null,
      offerEmailFooterNote: data.offerEmailFooterNote || null,
      offerEmailCompanyName: data.offerEmailCompanyName || null,
      offerEmailCompanyEmail: data.offerEmailCompanyEmail || null,
      offerEmailCompanyWeb: data.offerEmailCompanyWeb || null,
      offerEmailLinkExpiry: data.offerEmailLinkExpiry ?? null,
      // Event Reminder Settings
      enableEventReminders: data.enableEventReminders ?? false,
      eventReminderDaysBefore: data.eventReminderDaysBefore ?? 30,
      eventReminderEmailSubject: data.eventReminderEmailSubject || null,
      eventReminderEmailIntro: data.eventReminderEmailIntro || null,
      // Cancellation Fee Settings
      cancellationFeeEnabled: data.cancellationFeeEnabled ?? true,
      cancellationFeeDaysBefore: data.cancellationFeeDaysBefore ?? 14,
      cancellationFeeType: data.cancellationFeeType || 'percentage',
      cancellationFeeValue: data.cancellationFeeValue ?? 50,
      cancellationFeeText: data.cancellationFeeText || null,
      // Company Info (for contracts and documents)
      companyIco: data.companyIco || null,
      companyDic: data.companyDic || null,
      companyBankAccount: data.companyBankAccount || null,
      companyFullAddress: data.companyFullAddress || null,
    }

    if (!settings) {
      // Create if doesn't exist
      settings = await prisma.settings.create({
        data: settingsData,
      })
    } else {
      // Update existing
      settings = await prisma.settings.update({
        where: { id: settings.id },
        data: settingsData,
      })
    }

    return NextResponse.json({ data: settings }, { status: 200 })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
