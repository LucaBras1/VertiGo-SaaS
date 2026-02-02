/**
 * Prisma Database Client for TeamForge
 * Prisma 7 requires adapter for PostgreSQL
 */

import { PrismaClient } from '../generated/prisma'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

// Global storage for singleton pattern
declare global {
  // eslint-disable-next-line no-var
  var __teamBuildingPrisma: PrismaClient | undefined
  // eslint-disable-next-line no-var
  var __teamBuildingPool: Pool | undefined
}

/**
 * Create Prisma client with PostgreSQL adapter
 */
function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL!

  // Create PostgreSQL connection pool
  const pool = global.__teamBuildingPool ?? new Pool({ connectionString })

  // Store pool for reuse in development
  if (process.env.NODE_ENV !== 'production') {
    global.__teamBuildingPool = pool
  }

  // Create Prisma adapter
  const adapter = new PrismaPg(pool)

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
}

/**
 * Get the Prisma client (creates on first access)
 */
export function db(): PrismaClient {
  if (!global.__teamBuildingPrisma) {
    global.__teamBuildingPrisma = createPrismaClient()
  }
  return global.__teamBuildingPrisma
}

// Detect build time - when database connection is not available/valid
function isBuildTime(): boolean {
  const dbUrl = process.env.DATABASE_URL
  // No URL provided
  if (!dbUrl) return true
  // Contains placeholder values
  if (dbUrl.includes('CHANGE_ME') || dbUrl.includes('dummy')) return true
  // Explicit build time flag (can be set in CI/build scripts)
  if (process.env.NEXT_PHASE === 'phase-production-build') return true
  return false
}

// Create a stub that can handle chained property access and method calls
function createBuildTimeStub(): any {
  const handler: ProxyHandler<any> = {
    get(target, prop) {
      if (prop === 'then' || prop === 'catch' || prop === 'finally') {
        return undefined
      }
      if (typeof prop === 'symbol') {
        return undefined
      }
      return createBuildTimeStub()
    },
    apply() {
      return Promise.resolve(null)
    },
  }
  return new Proxy(function() {}, handler)
}

// Create a proxy for backwards compatibility
// At build time: returns a stub that handles property access without creating client
// At runtime: delegates to real PrismaClient
const prismaProxy = new Proxy({} as PrismaClient, {
  get(target, prop) {
    // Handle promise-like properties
    if (prop === 'then' || prop === 'catch' || prop === 'finally') {
      return undefined
    }
    // Handle Symbol properties
    if (typeof prop === 'symbol') {
      return undefined
    }

    // At build time, return a chainable stub
    if (isBuildTime()) {
      return createBuildTimeStub()
    }

    // At runtime, delegate to real client
    const client = db()
    const value = (client as any)[prop]
    if (typeof value === 'function') {
      return value.bind(client)
    }
    return value
  },
})

export const prisma: PrismaClient = prismaProxy

export default prisma
