/**
 * NextAuth.js Configuration for TeamForge
 * Authentication for the admin panel
 * Using @vertigo/auth shared package
 */

import { createAuthOptions, hashPassword, verifyPassword } from '@vertigo/auth'
import type { NextAuthOptions } from 'next-auth'

// Detect build time - when database connection is not available/valid
function isBuildTime(): boolean {
  const dbUrl = process.env.DATABASE_URL
  // No URL provided
  if (!dbUrl) return true
  // Contains placeholder values
  if (dbUrl.includes('CHANGE_ME') || dbUrl.includes('dummy')) return true
  // Explicit build time flag (can be set in CI/build scripts)
  if (process.env.NEXT_PHASE === 'phase-production-build') return true
  return false
}

// Lazy-loaded auth options
let _authOptions: NextAuthOptions | null = null

function getAuthOptionsImpl(): NextAuthOptions {
  if (!_authOptions) {
    const { db } = require('./db')
    const prisma = db()

    _authOptions = createAuthOptions({
      prisma: prisma as any,
      pages: {
        signIn: '/admin/login',
        error: '/admin/login',
      },
      schema: {
        passwordField: 'password',
      },
      multiTenant: {
        enabled: false,
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
      if (prop === 'providers') return []
      if (prop === 'callbacks') return {}
      if (prop === 'pages') return {}
      if (prop === 'session') return { strategy: 'jwt' }
      if (prop === 'secret') return process.env.NEXTAUTH_SECRET
      if (prop === 'then') return undefined
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

// Type extensions for NextAuth
declare module 'next-auth' {
  interface User {
    role?: string
  }
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      role: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string
    id?: string
  }
}
