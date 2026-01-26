import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const UpdateBillingSchema = z.object({
  billingName: z.string().max(200).optional(),
  ico: z.string().max(20).optional(),
  dic: z.string().max(20).optional(),
  address: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional(),
  bankAccount: z.string().max(50).optional(),
  iban: z.string().max(50).optional(),
  swift: z.string().max(20).optional(),
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
    const billingData = UpdateBillingSchema.parse(body)

    // Fetch current settings
    const tenant = await prisma.tenant.findUnique({
      where: { id: session.user.tenantId },
      select: { settings: true },
    })

    // Merge billing data into settings JSON
    const currentSettings = (tenant?.settings as TenantSettings) || {}
    const updatedSettings: TenantSettings = {
      ...currentSettings,
      billing: {
        ...currentSettings.billing,
        ...billingData,
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
        billing: (updatedTenant.settings as TenantSettings)?.billing || {},
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('PATCH /api/tenant/billing error:', error)
    return NextResponse.json(
      { error: 'Failed to update billing settings' },
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

    return NextResponse.json({
      success: true,
      data: {
        billing: settings.billing || {},
      },
    })
  } catch (error) {
    console.error('GET /api/tenant/billing error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch billing settings' },
      { status: 500 }
    )
  }
}
