/**
 * NextAuth Configuration - PartyPal
 * Authentication for the admin panel
 * Using @vertigo/auth shared package
 */

import { createAuthOptions, hashPassword, verifyPassword } from '@vertigo/auth'
import { prisma } from './prisma'

export const authOptions = createAuthOptions({
  prisma,
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
