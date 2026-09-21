import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ hostname: 'cdn.sanity.io', protocol: 'https' }],
  },
};

export default nextConfig;
