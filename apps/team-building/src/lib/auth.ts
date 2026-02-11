import { createAuthProxy, hashPassword, verifyPassword } from '@vertigo/auth'

export const authOptions = createAuthProxy({
  getPrisma: () => {
    const { db } = require('./db')
    return db()
  },
  config: {
    pages: { signIn: '/admin/login', error: '/admin/login' },
    schema: { passwordField: 'password' },
    multiTenant: { enabled: false },
    locale: 'cs',
  },
})

export { hashPassword, verifyPassword }

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
