import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.r2.cloudflarestorage.com',  // 修改 * 为 ** 以匹配子域
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;