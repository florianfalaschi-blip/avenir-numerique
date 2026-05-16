import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@avenir/ui', '@avenir/db', '@avenir/core'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  // Multi-tenant : le domaine est résolu via les headers HTTP
  // Chaque marque a son propre domaine (ex: imprim-eco.fr)
  // Le middleware Next.js lit le host header et injecte le tenant_id
}

export default nextConfig
