// Relative: next.config.ts loads this file through a transpiler without the `@/` alias.
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

import { isLiveFlavor, liveFlavors } from "../flavors/registry";

/**
 * Server-only env, validated by T3Env. Also validates the public
 * `NEXT_PUBLIC_*` variables that `env.ts` reads as plain constants, so the
 * client never ships zod; next.config.ts imports this module, which makes
 * every build and server boot run the check.
 */
export const serverEnv = createEnv({
  client: {
    NEXT_PUBLIC_SITE_URL: z.string().optional(),
    NEXT_PUBLIC_SANITY_PROJECT_ID: z.string().optional(),
    NEXT_PUBLIC_SANITY_DATASET: z.string().optional(),
    // The registry is plain data (ids and status), so this boundary may read it.
    NEXT_PUBLIC_FLAVOR: z
      .string()
      .refine((value) => value === "" || isLiveFlavor(value), {
        message: `NEXT_PUBLIC_FLAVOR must be a live edition id (${liveFlavors.join(", ")}), or empty to let visitors choose`,
      })
      .optional(),
    NEXT_PUBLIC_OWNER_BRANDING: z.enum(["true", "false"]).optional(),
    NEXT_PUBLIC_STUDIO_TITLE: z.string().optional(),
  },
  server: {
    SANITY_API_READ_TOKEN: z.string().optional(),
    SANITY_API_WRITE_TOKEN: z.string().optional(),
    SANITY_REVALIDATE_SECRET: z.string().optional(),
    ASK_COOKIE_SECRET: z.string().optional(),
    ASK_OWNER_PASSPHRASE: z.string().optional(),
    ASK_PENDING_CAP: z.string().optional(),
    ASK_TRUST_PROXY: z.string().optional(),
    NODE_ENV: z.enum(["development", "production", "test"]).optional(),
    CI: z.string().optional(),
    PLAYWRIGHT_CHROMIUM_PATH: z.string().optional(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SANITY_PROJECT_ID: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    NEXT_PUBLIC_SANITY_DATASET: process.env.NEXT_PUBLIC_SANITY_DATASET,
    NEXT_PUBLIC_FLAVOR: process.env.NEXT_PUBLIC_FLAVOR,
    NEXT_PUBLIC_OWNER_BRANDING: process.env.NEXT_PUBLIC_OWNER_BRANDING,
    NEXT_PUBLIC_STUDIO_TITLE: process.env.NEXT_PUBLIC_STUDIO_TITLE,
    SANITY_API_READ_TOKEN: process.env.SANITY_API_READ_TOKEN,
    SANITY_API_WRITE_TOKEN: process.env.SANITY_API_WRITE_TOKEN,
    SANITY_REVALIDATE_SECRET: process.env.SANITY_REVALIDATE_SECRET,
    ASK_COOKIE_SECRET: process.env.ASK_COOKIE_SECRET,
    ASK_OWNER_PASSPHRASE: process.env.ASK_OWNER_PASSPHRASE,
    ASK_PENDING_CAP: process.env.ASK_PENDING_CAP,
    ASK_TRUST_PROXY: process.env.ASK_TRUST_PROXY,
    NODE_ENV: process.env.NODE_ENV,
    CI: process.env.CI,
    PLAYWRIGHT_CHROMIUM_PATH: process.env.PLAYWRIGHT_CHROMIUM_PATH,
  },
});
