import type { NextAuthOptions } from 'next-auth'
import type { AuthConfig } from './types'
import { createAuthOptions } from './config'

type AuthProxyConfig = Omit<AuthConfig, 'prisma'>

interface CreateAuthProxyOptions {
  getPrisma: () => any
  config: AuthProxyConfig
}

function isBuildTime(): boolean {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) return true
  if (dbUrl.includes('dummy') || dbUrl.includes('CHANGE_ME')) return true
  if (process.env.NEXT_PHASE === 'phase-production-build') return true
  return false
}

export function createAuthProxy(options: CreateAuthProxyOptions): NextAuthOptions {
  const { getPrisma, config } = options

  let _authOptions: NextAuthOptions | null = null

  function getAuthOptionsImpl(): NextAuthOptions {
    if (!_authOptions) {
      const prisma = getPrisma()
      _authOptions = createAuthOptions({
        ...config,
        prisma: prisma as any,
      })
    }
    return _authOptions
  }

  return new Proxy({} as NextAuthOptions, {
    get(_target, prop) {
      if (isBuildTime()) {
        if (prop === 'providers') return []
        if (prop === 'callbacks') return {}
        if (prop === 'pages') return {}
        if (prop === 'session') return { strategy: 'jwt' }
        if (prop === 'secret') return process.env.NEXTAUTH_SECRET
        if (prop === 'then') return undefined
        return undefined
      }

      const opts = getAuthOptionsImpl()
      const value = (opts as any)[prop]
      if (typeof value === 'function') {
        return value.bind(opts)
      }
      return value
    },
  })
}
