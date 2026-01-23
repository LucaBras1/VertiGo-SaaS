/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@vertigo/ui', '@vertigo/ai-core', '@vertigo/database'],
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  images: {
    domains: ['localhost'],
  },
}

module.exports = nextConfig
