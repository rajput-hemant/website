/**
 * Public env values, safe to import from client code. Next inlines each
 * literal `process.env.NEXT_PUBLIC_*` read at build time, so this module adds
 * nothing to the client bundle. T3Env validation of these same variables runs
 * on the server in `env.server.ts` (loaded by next.config.ts, so every build
 * and server boot checks them); keeping zod out of here keeps it out of every
 * client chunk.
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

export const isSanityConfigured = env.sanity.projectId.length > 0;
export const isDevelopment = process.env.NODE_ENV === "development";
