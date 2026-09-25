import 'server-only';
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

const skipValidation = process.env.SKIP_ENV_VALIDATION === '1';

export const serverEnv = createEnv({
  server: {
    SANITY_API_READ_TOKEN: z.string().min(1),
    SANITY_API_WRITE_TOKEN: z.string().min(1),
    // Local testing only: Ask reads and writes go to an in-memory fixture store.
    SANITY_WRITE_DRY_RUN: z
      .enum(['0', '1'])
      .default('0')
      .transform((value) => value === '1'),
  },
  runtimeEnv: {
    SANITY_API_READ_TOKEN: process.env.SANITY_API_READ_TOKEN,
    SANITY_API_WRITE_TOKEN: process.env.SANITY_API_WRITE_TOKEN,
    SANITY_WRITE_DRY_RUN: process.env.SANITY_WRITE_DRY_RUN,
  },
  emptyStringAsUndefined: true,
  skipValidation,
});
