/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: [
    '@vertigo/ui',
    '@vertigo/admin',
    '@vertigo/ai-core',
    '@vertigo/auth',
    '@vertigo/config',
    '@vertigo/design-tokens',
    '@vertigo/email',
    '@vertigo/stripe',
  ],
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.vercel-storage.com',
      },
    ],
  },
  experimental: {
    serverActions: {
      enabled: true,
    },
  },
  // Optimize for server-side rendering with Prisma
  serverExternalPackages: ['@prisma/client', '@prisma/adapter-pg', 'pg'],
}

module.exports = nextConfig
