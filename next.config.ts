import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'w7.pngwing.com',
        port: '',
        pathname: '/pngs/**',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        port: '',
        pathname: '/photos/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.pixabay.com',
        port: '',
        pathname: '/photo/**',
      },
    ],
  },
  // Fix for dev tunnels and Server Actions
  experimental: {
    serverActions: {
      allowedOrigins: [
        'localhost:3000',
        '*.devtunnels.ms', // Allow dev tunnels
        '*.inc1.devtunnels.ms', // Specific to your tunnel
      ],
    },
  },
  allowedDevOrigins: [
    'http://localhost:3000',
    'http://192.168.91.92:3000',
    'https://lwhnw04g-3000.inc1.devtunnels.ms', // Add your dev tunnel
  ],
};

export default nextConfig;
