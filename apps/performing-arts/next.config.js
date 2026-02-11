/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@vertigo/ui', '@vertigo/admin', '@vertigo/ai-core', '@vertigo/config', '@vertigo/design-tokens', '@vertigo/database'],
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
}

module.exports = nextConfig
