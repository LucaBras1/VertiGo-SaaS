import 'next-auth'

declare module 'next-auth' {
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

  interface User {
    id: string
    email: string
    name?: string | null
    role: string
    tenantId: string
    tenantName: string
    tenantSlug: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
    tenantId: string
    tenantName: string
    tenantSlug: string
  }
}
