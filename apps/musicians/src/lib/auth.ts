import { createAuthProxy, hashPassword, verifyPassword } from '@vertigo/auth'

export const authOptions = createAuthProxy({
  getPrisma: () => {
    const mod = require('./db')
    return mod.default || mod.prisma
  },
  config: {
    pages: { signIn: '/auth/signin', error: '/auth/signin' },
    schema: { passwordField: 'password' },
    multiTenant: { enabled: true, includeSlug: true },
    locale: 'cs',
  },
})

export { hashPassword, verifyPassword }
