/** @type {import('next').NextConfig} */
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
