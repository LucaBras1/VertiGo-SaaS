/**
 * Health Check API
 * GET /api/health - Returns application health status
 */

export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getEnvironmentInfo } from '@/lib/env'

export async function GET() {
  const startTime = Date.now()

  const services: Record<string, boolean | string> = {
    database: false,
    stripe: false,
    email: false,
    ai: false,
  }

  // Check database connection
  try {
    await prisma.$queryRaw`SELECT 1`
    services.database = true
  } catch (error) {
    services.database = 'connection_failed'
  }

  // Check environment configuration
  const envInfo = getEnvironmentInfo()
  services.stripe = envInfo.hasStripe
  services.email = envInfo.hasEmail
  services.ai = envInfo.hasAI ? true : 'fallback_mode'

  const allHealthy = services.database === true && services.stripe === true && services.email === true

  const responseTime = Date.now() - startTime

  return NextResponse.json(
    {
      status: allHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      responseTimeMs: responseTime,
      environment: envInfo.nodeEnv,
      services,
      version: process.env.npm_package_version || '0.1.0',
    },
    {
      status: allHealthy ? 200 : 503,
    }
  )
}
