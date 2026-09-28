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
  /**
   * The one edition this deploy serves, from `NEXT_PUBLIC_FLAVOR`; empty or
   * unset lets visitors choose. `env.server.ts` rejects anything but a live
   * edition id, so every build and boot fails fast on a typo.
   */
  pinnedFlavor: process.env.NEXT_PUBLIC_FLAVOR || undefined,
} as const;

/** True when the deploy serves one edition: no picker, no way to switch. */
export const isEditionPinned = env.pinnedFlavor !== undefined;

/**
 * `NEXT_PUBLIC_OWNER_BRANDING=true` shows owner-only art that can't be derived
 * from the data (Minimal's handwritten signature). Off by default: those
 * elements fall back to a generic rendering of the resolved name.
 */
export const ownerBranding = process.env.NEXT_PUBLIC_OWNER_BRANDING === "true";

export const isSanityConfigured = env.sanity.projectId.length > 0;
export const isDevelopment = process.env.NODE_ENV === "development";
