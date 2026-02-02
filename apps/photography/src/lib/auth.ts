/**
 * NextAuth Configuration - ShootFlow
 * Authentication for photographer dashboard
 * Using @vertigo/auth shared package
 */

import { createAuthOptions, hashPassword, verifyPassword } from '@vertigo/auth'
import { prisma } from './prisma'

// Cast to any to bypass PrismaClient type mismatch between verticals
// Each vertical has its own generated Prisma client with different models
export const authOptions = createAuthOptions({
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
