/** @type {import('next').NextConfig} */

// Set dummy DATABASE_URL during build to prevent Prisma initialization errors
// The actual connection is only made at runtime when requests come in
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://dummy:dummy@localhost:5432/dummy'
}

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@vertigo/ui',
    '@vertigo/ai-core',
    '@vertigo/database',
    '@vertigo/auth',
    '@vertigo/email',
    '@vertigo/stripe',
  ],
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
}

module.exports = nextConfig
