/**
 * Public, build-time environment. Server-only secrets are read where they are
 * used so they can never be bundled into client code by accident.
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
