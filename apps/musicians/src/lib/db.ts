import { PrismaClient } from '../generated/prisma'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  pool: Pool | undefined
}

/**
 * Create a nested proxy that throws on any method call
 * This allows code like prisma.user.findUnique() to be evaluated at build time
 * without failing, but will throw at runtime if DATABASE_URL is missing
 */
function createBuildTimeProxy(): PrismaClient {
  const createNestedProxy = (path: string[] = []): unknown => {
    return new Proxy(() => {}, {
      get(target, prop: string | symbol) {
        if (prop === 'then' || prop === 'catch' || prop === 'finally' || typeof prop === 'symbol') {
          return undefined
        }
        // Return another proxy for chained access (prisma.user.findUnique)
        return createNestedProxy([...path, String(prop)])
      },
      apply() {
        // When called as a function, throw an error
        const fullPath = path.join('.')
        throw new Error(
          `DATABASE_URL environment variable is not set. Cannot call prisma.${fullPath}()`
        )
      },
    })
  }

  return createNestedProxy() as PrismaClient
}

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL

  // During build time (no DATABASE_URL), return a proxy that will throw on actual usage
  if (!connectionString) {
    console.warn('[Prisma] DATABASE_URL not set - database operations will fail at runtime')
    return createBuildTimeProxy()
  }

  // Create PostgreSQL connection pool
  const pool = globalForPrisma.pool ?? new Pool({ connectionString })

  // Store pool for reuse
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.pool = pool
  }

  // Create Prisma adapter
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
