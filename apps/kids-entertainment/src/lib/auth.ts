/**
 * NextAuth Configuration - PartyPal
 * Authentication for the admin panel
 * Using @vertigo/auth shared package
 */

import { createAuthOptions, hashPassword, verifyPassword } from '@vertigo/auth'
import type { AuthOptions } from 'next-auth'

let _authOptions: AuthOptions | null = null

// Lazy create authOptions to avoid Prisma initialization at import time
function getAuthOptions(): AuthOptions {
  if (!_authOptions) {
    // Import prisma only when needed
    const { prisma } = require('./prisma')

    // Cast to any to bypass PrismaClient type mismatch between verticals
    // Each vertical has its own generated Prisma client with different models
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

// Export as getter
export const authOptions: AuthOptions = new Proxy({} as AuthOptions, {
  get(_target, prop) {
    const opts = getAuthOptions()
    return opts[prop as keyof AuthOptions]
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
