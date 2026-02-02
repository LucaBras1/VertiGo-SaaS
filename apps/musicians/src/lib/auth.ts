/**
 * NextAuth Configuration - GigBook
 * Authentication for musician gig management
 * Using @vertigo/auth shared package
 */

import { createAuthOptions, hashPassword, verifyPassword } from '@vertigo/auth'
import { prisma } from './db'

// Cast to any to bypass PrismaClient type mismatch between verticals
// Each vertical has its own generated Prisma client with different models
export const authOptions = createAuthOptions({
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

// Re-export utilities for convenience
export { hashPassword, verifyPassword }

// Type extensions are in src/types/next-auth.d.ts
