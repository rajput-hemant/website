import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

/**
 * Static pages have no per-request server pass to hand out a nonce, and Next
 * inlines the RSC payload as an unhashable <script> on every page, so
 * script-src needs 'unsafe-inline'. Dev additionally needs 'unsafe-eval' for
 * React's dev-mode tooling (fast refresh, source overlays).
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://cdn.sanity.io",
  "media-src 'self' https://cdn.sanity.io",
  "font-src 'self'",
  "connect-src 'self' https://*.api.sanity.io wss://*.api.sanity.io",
  "worker-src 'self' blob:",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), gyroscope=(self), accelerometer=(self), magnetometer=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "X-Frame-Options", value: "DENY" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // The floating dev badge overlaps page content at phone widths.
  devIndicators: false,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },

  async redirects() {
    return [
      { source: "/changelog", destination: "/now#log", permanent: true },
      { source: "/changelog.md", destination: "/now.md", permanent: true },
    ];
  },

  async headers() {
    return [
      {
        // Every route except /studio, which carries the embedded Sanity Studio's own relaxed policy.
        source: "/((?!studio).*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
