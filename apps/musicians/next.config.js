/** @type {import('next').NextConfig} */

// Set dummy DATABASE_URL during build to prevent Prisma initialization errors
// The actual connection is only made at runtime when requests come in
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://dummy:dummy@localhost:5432/dummy'
}

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@vertigo/ai-core',
    '@vertigo/ui',
    '@vertigo/database',
    '@vertigo/config',
    '@vertigo/auth',
    '@vertigo/email',
  ],
  images: {
    domains: ['localhost', 'vercel-blob.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.vercel-blob.com',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
}

module.exports = nextConfig
