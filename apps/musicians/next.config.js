/** @type {import('next').NextConfig} */
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
