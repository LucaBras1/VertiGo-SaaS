/**
 * Health Check API Endpoint
 *
 * Used for production monitoring and load balancer health checks.
 * Returns system status, database connectivity, and version info.
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

interface HealthCheckResponse {
  status: 'ok' | 'degraded' | 'error'
  timestamp: string
  version: string
  uptime: number
  checks: {
    database: {
      status: 'ok' | 'error'
      latencyMs?: number
      error?: string
    }
    memory: {
      status: 'ok' | 'warning'
      usedMB: number
      totalMB: number
      percentage: number
    }
  }
}

export async function GET() {
  const startTime = Date.now()

  // Initialize response
  const response: HealthCheckResponse = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '0.1.0',
    uptime: process.uptime(),
    checks: {
      database: { status: 'ok' },
      memory: { status: 'ok', usedMB: 0, totalMB: 0, percentage: 0 },
    },
  }

  // Check database connectivity
  try {
    const dbStart = Date.now()
    await prisma.$queryRaw`SELECT 1`
    response.checks.database = {
      status: 'ok',
      latencyMs: Date.now() - dbStart,
    }
  } catch (error) {
    response.checks.database = {
      status: 'error',
      error: error instanceof Error ? error.message : 'Database connection failed',
    }
    response.status = 'degraded'
  }

  // Check memory usage
  const memoryUsage = process.memoryUsage()
  const usedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024)
  const totalMB = Math.round(memoryUsage.heapTotal / 1024 / 1024)
  const percentage = Math.round((usedMB / totalMB) * 100)

  response.checks.memory = {
    status: percentage > 90 ? 'warning' : 'ok',
    usedMB,
    totalMB,
    percentage,
  }

  if (percentage > 90) {
    response.status = response.status === 'ok' ? 'degraded' : response.status
  }

  // Return appropriate status code based on health
  const statusCode = response.status === 'ok' ? 200 : response.status === 'degraded' ? 200 : 503

  return NextResponse.json(response, {
    status: statusCode,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'X-Response-Time': `${Date.now() - startTime}ms`,
    },
  })
}

// HEAD request for simple load balancer checks
export async function HEAD() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return new NextResponse(null, { status: 200 })
  } catch {
    return new NextResponse(null, { status: 503 })
  }
}
