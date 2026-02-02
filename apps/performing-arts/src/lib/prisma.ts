import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

// Generic model operations type
interface ModelOperations {
  findUnique: (args: object) => Promise<unknown>
  findFirst: (args: object) => Promise<unknown>
  findMany: (args?: object) => Promise<unknown[]>
  create: (args: { data: object }) => Promise<unknown>
  update: (args: { where: object; data: object }) => Promise<unknown>
  delete: (args: { where: object }) => Promise<unknown>
  deleteMany: (args?: object) => Promise<unknown>
  count: (args?: object) => Promise<number>
}

// Type placeholder until Prisma generates proper types from our schema
// After running `npx prisma generate`, this should be replaced with the generated client
interface PrismaClientType {
  user: ModelOperations
  tenant: ModelOperations
  production: ModelOperations
  performance: ModelOperations
  castMember: ModelOperations
  crewMember: ModelOperations
  rehearsal: ModelOperations
  rehearsalAttendance: ModelOperations
  rehearsalNote: ModelOperations
  venue: ModelOperations
  techRider: ModelOperations
  equipment: ModelOperations
  costume: ModelOperations
  scene: ModelOperations
  passwordResetToken: ModelOperations
  verificationToken: ModelOperations
  account: ModelOperations
  userSession: ModelOperations
  notificationPreference: ModelOperations
  notificationLog: ModelOperations
  aILog: ModelOperations
  $transaction: <T>(fn: (tx: PrismaClientType) => Promise<T>) => Promise<T>
  $connect: () => Promise<void>
  $disconnect: () => Promise<void>
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientType | undefined
  pool: Pool | undefined
}

function createPrismaClient(): PrismaClientType {
  const connectionString = process.env.DATABASE_URL

  // During build time (no DATABASE_URL), return a proxy that will throw on actual usage
  // This allows the build to complete but prevents runtime errors if database isn't configured
  if (!connectionString) {
    console.warn('[Prisma] DATABASE_URL not set - database operations will fail at runtime')
    // Return a proxy that throws on any property access (lazy error)
    return new Proxy({} as PrismaClientType, {
      get: (target, prop) => {
        if (prop === 'then' || prop === 'catch' || typeof prop === 'symbol') {
          return undefined
        }
        // Return a proxy for model operations too
        return new Proxy({}, {
          get: () => () => {
            throw new Error('DATABASE_URL environment variable is not set')
          }
        })
      },
    })
  }

  // Create connection pool for Prisma 7 adapter
  const pool = globalForPrisma.pool ?? new Pool({ connectionString })
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.pool = pool
  }

  const adapter = new PrismaPg(pool)

  // Dynamic import of PrismaClient - use require for commonjs compatibility
  const { PrismaClient } = require('@prisma/client')

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  }) as PrismaClientType
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma
