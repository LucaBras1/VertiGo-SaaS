/**
 * NextAuth Configuration - GigBook
 * Authentication for musician gig management
 * Using @vertigo/auth shared package
 */

import { createAuthOptions, hashPassword, verifyPassword } from '@vertigo/auth'
import type { NextAuthOptions } from 'next-auth'

// Detect build time
function isBuildTime(): boolean {
  const dbUrl = process.env.DATABASE_URL
  return !dbUrl || dbUrl.includes('dummy') || dbUrl.includes('localhost:5432/dummy')
}

// Lazy-loaded auth options
let _authOptions: NextAuthOptions | null = null

function getAuthOptionsImpl(): NextAuthOptions {
  if (!_authOptions) {
    // Use require for lazy loading to avoid build-time initialization
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const dbModule = require('./db')
    // Use the default export (prisma proxy) which handles lazy loading
    const prisma = dbModule.default || dbModule.prisma

    _authOptions = createAuthOptions({
      prisma: prisma as any,
      pages: {
        signIn: '/auth/signin',
        error: '/auth/signin',
      },
      schema: {
        passwordField: 'password',
      },
      multiTenant: {
        enabled: true,
        includeSlug: true,
      },
      locale: 'cs',
    })
  }
  return _authOptions
}

// Create auth options proxy
// At build time: returns a stub object that satisfies NextAuthOptions shape
// At runtime: returns the actual auth options
export const authOptions: NextAuthOptions = new Proxy({} as NextAuthOptions, {
  get(target, prop) {
    // At build time, return stub values
    if (isBuildTime()) {
      // Return values that satisfy NextAuthOptions interface minimally
      if (prop === 'providers') return []
      if (prop === 'callbacks') return {}
      if (prop === 'pages') return {}
      if (prop === 'session') return { strategy: 'jwt' }
      if (prop === 'secret') return process.env.NEXTAUTH_SECRET
      if (prop === 'then') return undefined // Not a promise
      return undefined
    }

    // At runtime, delegate to real auth options
    const options = getAuthOptionsImpl()
    const value = (options as any)[prop]
    if (typeof value === 'function') {
      return value.bind(options)
    }
    return value
  },
})

// Re-export utilities for convenience
export { hashPassword, verifyPassword }

// Type extensions are in src/types/next-auth.d.ts
