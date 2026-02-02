/**
 * NextAuth Configuration - FitAdmin
 * Authentication for fitness management dashboard
 * Using @vertigo/auth shared package
 */

import { createAuthOptions, hashPassword, verifyPassword } from '@vertigo/auth'
import { prisma } from './prisma'

// Cast to any to bypass PrismaClient type mismatch between verticals
// Each vertical has its own generated Prisma client with different models
export const authOptions = createAuthOptions({
  prisma: prisma as any,
  pages: {
    signIn: '/login',
    error: '/login',
  },
  schema: {
    passwordField: 'password',
  },
  multiTenant: {
    enabled: true,
    includeSlug: false,
  },
  locale: 'cs',
})

// Re-export utilities for convenience
export { hashPassword, verifyPassword }

// Type extensions are in src/types/next-auth.d.ts
