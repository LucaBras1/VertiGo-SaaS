import NextAuth from 'next-auth'

// Force dynamic to avoid build-time issues
export const dynamic = 'force-dynamic'

// Lazy load auth options to avoid build-time prisma issues
async function getHandler() {
  const { authOptions } = await import('@/lib/auth')
  return NextAuth(authOptions)
}

export async function GET(request: Request, context: { params: Promise<{ nextauth: string[] }> }) {
  const handler = await getHandler()
  return handler(request, context)
}

export async function POST(request: Request, context: { params: Promise<{ nextauth: string[] }> }) {
  const handler = await getHandler()
  return handler(request, context)
}
