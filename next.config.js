/** @type {import('next').NextConfig} */

// Backend base URL (without /api path) - for rewrites
// Use NEXT_PUBLIC_BACKEND_URL if set, otherwise extract base from NEXT_PUBLIC_API_URL
const getBackendBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_BACKEND_URL) {
    return process.env.NEXT_PUBLIC_BACKEND_URL;
  }
  // If NEXT_PUBLIC_API_URL includes /api, strip it to get base URL
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
  // Remove /api/v1 or /api from the end if present
  return apiUrl.replace(/\/api(\/v1)?$/, '');
};

const BACKEND_BASE_URL = getBackendBaseUrl();

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
        destination: `${BACKEND_BASE_URL}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;


