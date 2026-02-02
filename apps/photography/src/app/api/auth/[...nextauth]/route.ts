import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

// Force dynamic to avoid build-time Prisma proxy issues
export const dynamic = 'force-dynamic'

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
