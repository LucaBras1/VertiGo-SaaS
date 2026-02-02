/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@vertigo/ui',
    '@vertigo/ai-core',
    '@vertigo/database',
    '@vertigo/auth',
    '@vertigo/email',
  ],
  images: {
    domains: [
      'localhost',
      // Add your S3/CDN domains here
      's3.amazonaws.com',
      'cloudfront.net',
    ],
  },
  experimental: {
    // Exclude Prisma and pg from bundling - they'll be available at runtime
    serverComponentsExternalPackages: ['@prisma/client', '@prisma/adapter-pg', 'pg'],
  },
}

module.exports = nextConfig
