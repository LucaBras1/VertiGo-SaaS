interface CreatePrismaProxyOptions<T> {
  createClient: () => T
  globalKey: string
  envVar?: string
}

function isBuildTime(envVar: string): boolean {
  const dbUrl = process.env[envVar]
  if (!dbUrl) return true
  if (dbUrl.includes('dummy') || dbUrl.includes('CHANGE_ME')) return true
  if (process.env.NEXT_PHASE === 'phase-production-build') return true
  return false
}

function createBuildTimeStub(): any {
  const handler: ProxyHandler<any> = {
    get(_target, prop) {
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
  return new Proxy(function () {}, handler)
}

const globalStore = globalThis as any

export function createPrismaProxy<T extends object>(
  options: CreatePrismaProxyOptions<T>
): { prisma: T; db: () => T } {
  const { createClient, globalKey, envVar = 'DATABASE_URL' } = options

  const prismaKey = `__vertigo_prisma_${globalKey}`

  function db(): T {
    if (!globalStore[prismaKey]) {
      globalStore[prismaKey] = createClient()
    }
    return globalStore[prismaKey]
  }

  const prisma = new Proxy({} as T, {
    get(_target, prop) {
      if (prop === 'then' || prop === 'catch' || prop === 'finally') {
        return undefined
      }
      if (typeof prop === 'symbol') {
        return undefined
      }

      if (isBuildTime(envVar)) {
        return createBuildTimeStub()
      }

      const client = db()
      const value = (client as any)[prop]
      if (typeof value === 'function') {
        return value.bind(client)
      }
      return value
    },
  })

  return { prisma, db }
}
