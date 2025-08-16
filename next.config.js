/** @type {import('next').NextConfig} */
const { withExpo } = require('@expo/next-adapter');

const nextConfig = {
  // Ensure environment variables are available
  env: {
    EXPO_PUBLIC_RORK_API_BASE_URL: process.env.EXPO_PUBLIC_RORK_API_BASE_URL,
    EXPO_PUBLIC_GOOGLE_AI_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_AI_API_KEY,
    EXPO_PUBLIC_UNSPLASH_ACCESS_KEY: process.env.EXPO_PUBLIC_UNSPLASH_ACCESS_KEY,
    EXPO_PUBLIC_PEXELS_API_KEY: process.env.EXPO_PUBLIC_PEXELS_API_KEY,
    EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
    EXPO_PUBLIC_API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL,
  },
  // Add rewrites to handle all routes
  async rewrites() {
    return [
      {
        source: '/:path*',
        destination: '/',
      },
    ];
  },
};

module.exports = withExpo(nextConfig);