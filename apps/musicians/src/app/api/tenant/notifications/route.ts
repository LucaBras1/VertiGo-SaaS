import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const UpdateNotificationsSchema = z.object({
  enableInquiries: z.boolean().optional(),
  enableConfirmations: z.boolean().optional(),
  enablePayments: z.boolean().optional(),
  enableReminders: z.boolean().optional(),
})

interface TenantSettings {
  billing?: {
    billingName?: string
    ico?: string
    dic?: string
    address?: string
    city?: string
    postalCode?: string
    bankAccount?: string
    iban?: string
    swift?: string
  }
  notifications?: {
    enableInquiries?: boolean
    enableConfirmations?: boolean
    enablePayments?: boolean
    enableReminders?: boolean
  }
  [key: string]: unknown
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const notificationsData = UpdateNotificationsSchema.parse(body)

    // Fetch current settings
    const tenant = await prisma.tenant.findUnique({
      where: { id: session.user.tenantId },
      select: { settings: true },
    })

    // Merge notifications data into settings JSON
    const currentSettings = (tenant?.settings as TenantSettings) || {}
    const updatedSettings: TenantSettings = {
      ...currentSettings,
      notifications: {
        ...currentSettings.notifications,
        ...notificationsData,
      },
    }

    const updatedTenant = await prisma.tenant.update({
      where: { id: session.user.tenantId },
      data: { settings: updatedSettings },
      select: {
        id: true,
        settings: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        notifications: (updatedTenant.settings as TenantSettings)?.notifications || {},
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('PATCH /api/tenant/notifications error:', error)
    return NextResponse.json(
      { error: 'Failed to update notification settings' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: session.user.tenantId },
      select: { settings: true },
    })

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    const settings = (tenant.settings as TenantSettings) || {}

    // Return with defaults
    const notifications = {
      enableInquiries: settings.notifications?.enableInquiries ?? true,
      enableConfirmations: settings.notifications?.enableConfirmations ?? true,
      enablePayments: settings.notifications?.enablePayments ?? true,
      enableReminders: settings.notifications?.enableReminders ?? false,
    }

    return NextResponse.json({
      success: true,
      data: { notifications },
    })
  } catch (error) {
    console.error('GET /api/tenant/notifications error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notification settings' },
      { status: 500 }
    )
  }
}
