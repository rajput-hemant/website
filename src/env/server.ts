import 'server-only';
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

const skipValidation = process.env.SKIP_ENV_VALIDATION === '1';

export const serverEnv = createEnv({
  server: {
    SANITY_API_READ_TOKEN: z.string().min(1),
    SANITY_REVALIDATE_SECRET: z.string().min(32),
  },
  runtimeEnv: {
    SANITY_API_READ_TOKEN:
      process.env.SANITY_API_READ_TOKEN ||
      (skipValidation ? 'build-only' : undefined),
    SANITY_REVALIDATE_SECRET:
      process.env.SANITY_REVALIDATE_SECRET ||
      (skipValidation ? 'build-only-build-only-build-only' : undefined),
  },
  emptyStringAsUndefined: true,
  skipValidation,
});
