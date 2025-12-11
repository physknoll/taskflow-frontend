/** @type {import('next').NextConfig} */

// Backend API URL - use environment variable in production, localhost for development
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5001',
        pathname: '/api/v1/assets/**',
      },
      {
        protocol: 'https',
        hostname: '**.railway.app',
        pathname: '/api/v1/assets/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;


