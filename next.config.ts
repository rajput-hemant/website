import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: 'cdn.sanity.io', protocol: 'https' },
      { hostname: 'avatars.githubusercontent.com', protocol: 'https' },
      { hostname: 'lh3.googleusercontent.com', protocol: 'https' },
    ],
  },
  // Only the ask circuit breaker needs `'use cache'`; `cacheComponents` stays
  // off so the rest of the site keeps its static-by-default fetch model.
  experimental: { useCache: true },
};

export default nextConfig;
