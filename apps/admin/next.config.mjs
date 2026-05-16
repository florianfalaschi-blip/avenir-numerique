/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Transpile les packages workspace pour qu'ils soient bundlés avec l'app
  transpilePackages: ['@avenir/ui', '@avenir/core'],
};

export default nextConfig;
