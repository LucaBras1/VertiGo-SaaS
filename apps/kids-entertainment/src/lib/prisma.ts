/**
 * Prisma Client Singleton
 * Prisma 7 requires adapter for PostgreSQL
 *
 * Uses getter function to avoid initialization during build
 */

import { PrismaClient } from '../generated/prisma'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined
  // eslint-disable-next-line no-var
  var __pool: Pool | undefined
}

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL

  // Build-time guard - return proxy instead of throwing
  // This allows Next.js build to complete without DATABASE_URL
  if (!connectionString) {
    console.warn('[Prisma] DATABASE_URL not set - database operations will fail at runtime')
    return new Proxy({} as PrismaClient, {
      get: (target, prop) => {
        if (prop === 'then' || prop === 'catch' || typeof prop === 'symbol') {
          return undefined
        }
        return () => {
          throw new Error('DATABASE_URL environment variable is not set')
        }
      },
    })
  }

  // Create PostgreSQL connection pool
  const pool = global.__pool ?? new Pool({ connectionString })

  if (process.env.NODE_ENV !== 'production') {
    global.__pool = pool
  }

  const adapter = new PrismaPg(pool)

  const client = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

  return client
}

// In production, always create new client
// In development, reuse global client to avoid too many connections
export const prisma = global.__prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = prisma
}

export default prisma
