import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const publicEnv = createEnv({
  shared: {
    NODE_ENV: z.enum(["development", "production", "test"]).optional(),
  },
  client: {
    NEXT_PUBLIC_SITE_URL: z.string().optional(),
    NEXT_PUBLIC_SANITY_PROJECT_ID: z.string().optional(),
    NEXT_PUBLIC_SANITY_DATASET: z.string().optional(),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SANITY_PROJECT_ID: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    NEXT_PUBLIC_SANITY_DATASET: process.env.NEXT_PUBLIC_SANITY_DATASET,
  },
});

export const env = {
  siteUrl: (publicEnv.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(
    /\/$/,
    ""
  ),
  sanity: {
    projectId: publicEnv.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "",
    dataset: publicEnv.NEXT_PUBLIC_SANITY_DATASET ?? "production",
    apiVersion: "2026-09-01",
  },
} as const;

export const isSanityConfigured = env.sanity.projectId.length > 0;
export const isDevelopment = publicEnv.NODE_ENV === "development";
