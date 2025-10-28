import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Turbopack config
  turbopack: {
    resolveAlias: {
      '@napi-rs/canvas': '@napi-rs/canvas',
    },
  },
  // Only use serverExternalPackages, not both
  serverExternalPackages: ['@napi-rs/canvas'],
  // Remove transpilePackages line!
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.steamstatic.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.cloudflare.steamstatic.com',
      },
    ],
  },
}

export default nextConfig