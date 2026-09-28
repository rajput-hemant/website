import type { NextConfig } from "next";

import { serverEnv } from "./lib/env.server";

const isDev = serverEnv.NODE_ENV !== "production";

/**
 * Static pages have no per-request server pass to hand out a nonce, and Next
 * inlines the RSC payload as an unhashable <script> on every page, so
 * script-src needs 'unsafe-inline'. Dev additionally needs 'unsafe-eval' for
 * React's dev-mode tooling (fast refresh, source overlays).
 */
const baseCsp = [
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
];

const csp = baseCsp.join("; ");

/**
 * Only over HTTPS: on a plain-HTTP origin (localhost, a LAN address, `next
 * start` without a TLS proxy) Safari applies `upgrade-insecure-requests` to
 * same-origin CSS, JS and navigations, and caches HSTS for the host, so the
 * page loads unstyled and every redirect fails to connect. Chrome exempts
 * localhost, which is why this only showed up in Safari.
 */
const httpsCsp = [...baseCsp, "upgrade-insecure-requests"].join("; ");
const hsts = {
  key: "Strict-Transport-Security",
  value: "max-age=63072000; includeSubDomains; preload",
};

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
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
  reactCompiler: true,
  // The floating dev badge overlaps page content at phone widths.
  devIndicators: false,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
  // Each edition has its own root layout, so unmatched URLs need a global 404.
  experimental: { globalNotFound: true },

  headers() {
    return [
      {
        // Every route except /studio, which carries the embedded Sanity Studio's own relaxed policy.
        source: "/((?!studio).*)",
        headers: securityHeaders,
      },
      {
        // Same routes, served over HTTPS behind a TLS proxy (Vercel sets
        // x-forwarded-proto); the later CSP overrides the one above.
        source: "/((?!studio).*)",
        has: [{ type: "header", key: "x-forwarded-proto", value: "https" }],
        headers: [{ key: "Content-Security-Policy", value: httpsCsp }, hsts],
      },
      {
        // The editions' internal trees; public URLs never name the edition.
        source: "/f/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex" }],
      },
    ];
  },
};

export default nextConfig;
