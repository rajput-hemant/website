/**
 * Public, build-time environment. This module is imported by client
 * components (via `content/site.ts`), so server secrets are never put in the
 * `env` object itself; `readSanityWriteToken` below is a function, read only
 * when a server module calls it, and never inlined into client output the
 * way a `NEXT_PUBLIC_*` value is.
 */
export const env = {
  siteUrl: (
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ).replace(/\/$/, ""),
  sanity: {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "",
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
    apiVersion: "2026-09-01",
  },
} as const;

/** True when a Sanity project is configured; otherwise the site renders bundled fallback content. */
export const isSanityConfigured = env.sanity.projectId.length > 0;

/** The Sanity Editor token used by the ask and visits write stores. Server-only. */
export function readSanityWriteToken(): string {
  return process.env.SANITY_API_WRITE_TOKEN ?? "";
}
