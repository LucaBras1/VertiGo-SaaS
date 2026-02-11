import { createAuthProxy, hashPassword, verifyPassword } from '@vertigo/auth'

export const authOptions = createAuthProxy({
  getPrisma: () => {
    const mod = require('./prisma')
    return mod.default || mod.prisma
  },
  config: {
    pages: { signIn: '/login', error: '/login' },
    schema: { passwordField: 'password' },
    multiTenant: { enabled: true, includeSlug: false },
    locale: 'en',
  },
})

export { hashPassword, verifyPassword }
