import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@avenir/ui', '@avenir/db', '@avenir/core'],
  experimental: {
    // Activer si besoin d'optimisations
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

export default nextConfig
