import { PrismaClient } from '../generated/prisma'

// Global storage for singleton pattern
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined
}

/**
 * Create Prisma client
 */
function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
}

/**
 * Get the Prisma client (creates on first access)
 */
export function db(): PrismaClient {
  if (!global.__prisma) {
    global.__prisma = createPrismaClient()
  }
  return global.__prisma
}

// Detect build time
function isBuildTime(): boolean {
  const dbUrl = process.env.DATABASE_URL
  return !dbUrl || dbUrl.includes('dummy') || dbUrl.includes('localhost:5432/dummy')
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
