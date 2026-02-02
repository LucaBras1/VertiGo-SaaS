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
}

module.exports = nextConfig
