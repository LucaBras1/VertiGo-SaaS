/**
 * NextAuth Configuration - PartyPal
 * Authentication for the admin panel
 * Using @vertigo/auth shared package
 */

import { createAuthOptions, hashPassword, verifyPassword } from '@vertigo/auth'
import { prisma } from './prisma'

// Cast to any to bypass PrismaClient type mismatch between verticals
// Each vertical has its own generated Prisma client with different models
export const authOptions = createAuthOptions({
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
