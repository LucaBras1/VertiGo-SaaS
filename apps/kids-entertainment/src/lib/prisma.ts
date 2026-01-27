/**
 * Prisma Client Singleton
 * Prisma 7 requires adapter for PostgreSQL
 */

import { PrismaClient } from '../generated/prisma'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  pool: Pool | undefined
}

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL

  // During build time (no DATABASE_URL), return a proxy that will throw on actual usage
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
  const pool = globalForPrisma.pool ?? new Pool({ connectionString })

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.pool = pool
  }

  const adapter = new PrismaPg(pool)

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma
