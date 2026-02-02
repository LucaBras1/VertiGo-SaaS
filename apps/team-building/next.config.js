/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@vertigo/ai-core',
    '@vertigo/auth',
    '@vertigo/database',
    '@vertigo/email',
    '@vertigo/stripe',
    '@vertigo/ui',
  ],
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

module.exports = nextConfig
