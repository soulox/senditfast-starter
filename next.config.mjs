/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: { allowedOrigins: ['*'] }
  },
  // Optimize webpack for NextAuth compatibility
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Ensure NextAuth uses Node.js runtime properly
      config.externals = config.externals || [];
      config.externals.push({
        'next-auth': 'commonjs next-auth',
        'next-auth/providers/credentials': 'commonjs next-auth/providers/credentials',
        'next-auth/providers/google': 'commonjs next-auth/providers/google',
      });
    }
    return config;
  },
  // Transpile next-auth for better compatibility
  transpilePackages: ['next-auth'],
};
export default nextConfig;
