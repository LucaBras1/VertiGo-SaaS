/**
 * NextAuth Configuration - ShootFlow
 * Authentication for photographer dashboard
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
    const { db } = require('./prisma')
    const prisma = db()

    _authOptions = createAuthOptions({
      prisma: prisma as any,
      pages: {
        signIn: '/auth/login',
        error: '/auth/login',
      },
      schema: {
        passwordField: 'passwordHash',
      },
      multiTenant: {
        enabled: true,
        includeSlug: false,
      },
      locale: 'en',
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
    const value = (options as unknown as Record<string, unknown>)[prop as string]
    if (typeof value === 'function') {
      return value.bind(options)
    }
    return value
  },
})

// Re-export utilities for convenience
export { hashPassword, verifyPassword }

// Type extensions for NextAuth
declare module 'next-auth' {
  interface User {
    role?: string
    tenantId?: string
    tenantName?: string
  }
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      role: string
      tenantId: string
      tenantName: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string
    id?: string
    tenantId?: string
    tenantName?: string
  }
}
