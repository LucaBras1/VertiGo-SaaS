/**
 * Prisma Client Singleton
 * Ensures single instance in development with hot reloading
 * Prisma 7 requires adapter for PostgreSQL
 */

import { PrismaClient } from '../generated/prisma'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  pool: Pool | undefined
}

/**
 * Create a nested proxy that allows chained property access
 * but returns a Promise that rejects when the final method is called.
 * This lets static analysis pass while failing at runtime.
 */
function createBuildTimeProxy(): PrismaClient {
  const createNestedProxy = (): unknown => {
    const handler: ProxyHandler<() => void> = {
      get(target, prop: string | symbol) {
        // Handle special properties that should return specific values
        if (prop === 'then' || prop === 'catch' || prop === 'finally') {
          return undefined
        }
        if (typeof prop === 'symbol') {
          return undefined
        }
        if (prop === '$connect' || prop === '$disconnect') {
          return () => Promise.resolve()
        }
        if (prop === '$on' || prop === '$use') {
          return () => {}
        }
        if (prop === '$extends') {
          return () => createBuildTimeProxy()
        }
        if (prop === '$transaction') {
          return () => Promise.reject(new Error('DATABASE_URL not set'))
        }
        if (prop === '$queryRaw' || prop === '$executeRaw' || prop === '$queryRawUnsafe' || prop === '$executeRawUnsafe') {
          return () => Promise.reject(new Error('DATABASE_URL not set'))
        }
        // Return another proxy for chained access (e.g., prisma.user.findUnique)
        return createNestedProxy()
      },
      apply() {
        // When called as a function, return a rejected promise
        return Promise.reject(
          new Error('DATABASE_URL environment variable is not set - cannot execute database query')
        )
      },
    }
    return new Proxy(() => {}, handler)
  }

  // Cast to PrismaClient to satisfy TypeScript
  return createNestedProxy() as unknown as PrismaClient
}

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL

  // Build-time guard - returns nested proxy instead of throwing
  if (!connectionString) {
    console.warn('[Prisma] DATABASE_URL not set - database operations will fail at runtime')
    return createBuildTimeProxy()
  }

  // Create PostgreSQL connection pool
  const pool = globalForPrisma.pool ?? new Pool({ connectionString })

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.pool = pool
  }

  // Prisma 7 - PostgreSQL adapter pattern
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
