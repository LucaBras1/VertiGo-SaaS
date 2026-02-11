import { createAuthProxy, hashPassword, verifyPassword } from '@vertigo/auth'

export const authOptions = createAuthProxy({
  getPrisma: () => {
    const { db } = require('./prisma')
    return db()
  },
  config: {
    pages: { signIn: '/auth/login', error: '/auth/login' },
    schema: { passwordField: 'passwordHash' },
    multiTenant: { enabled: true, includeSlug: false },
    locale: 'en',
  },
})

export { hashPassword, verifyPassword }

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
