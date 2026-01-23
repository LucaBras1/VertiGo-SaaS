/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'divadlo-studna.cz',
      },
      {
        protocol: 'https',
        hostname: 'www.divadlo-studna.cz',
      },
    ],
  },
}

module.exports = nextConfig
