import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { checkAllClientBadges } from '@/lib/badges/badge-checker'

// POST /api/cron/check-badges - Check and award badges for all clients
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check badges for all clients
    const result = await checkAllClientBadges(session.user.tenantId)

    return NextResponse.json({
      success: true,
      ...result,
      message: `Zkontrolováno ${result.checked} klientů, uděleno ${result.awarded} odznaků`,
    })
  } catch (error) {
    console.error('Error in badge check cron:', error)
    return NextResponse.json(
      { error: 'Chyba při kontrole odznaků' },
      { status: 500 }
    )
  }
}
