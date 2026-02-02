/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
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
