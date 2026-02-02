/**
 * NextAuth Configuration - GigBook
 * Authentication for musician gig management
 * Using @vertigo/auth shared package
 */

import { createAuthOptions, hashPassword, verifyPassword } from '@vertigo/auth'
import { prisma } from './db'

export const authOptions = createAuthOptions({
  prisma,
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

// Re-export utilities for convenience
export { hashPassword, verifyPassword }

// Type extensions for NextAuth
declare module 'next-auth' {
  interface User {
    role?: string
    tenantId?: string
    tenantName?: string
    tenantSlug?: string
  }
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      role: string
      tenantId: string
      tenantName: string
      tenantSlug: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string
    id?: string
    tenantId?: string
    tenantName?: string
    tenantSlug?: string
  }
}
