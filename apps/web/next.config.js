/** @type {import('next').NextConfig} */
const apiTarget = process.env.API_URL || 'http://localhost:3002';

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: true
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${apiTarget}/api/:path*`
      }
    ];
  }
};

module.exports = nextConfig;
