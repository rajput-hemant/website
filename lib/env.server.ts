import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const serverEnv = createEnv({
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
