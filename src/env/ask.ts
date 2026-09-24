import 'server-only';
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const askEnv = createEnv({
  server: {
    ASK_SUBMISSION_SECRET: z.string().min(32),
    // 'use cache' and cacheLife require the write step to be skippable so the
    // route can be exercised end to end without touching the live dataset.
    SANITY_WRITE_DRY_RUN: z
      .enum(['0', '1'])
      .default('0')
      .transform((value) => value === '1'),
  },
  runtimeEnv: {
    ASK_SUBMISSION_SECRET: process.env.ASK_SUBMISSION_SECRET,
    SANITY_WRITE_DRY_RUN: process.env.SANITY_WRITE_DRY_RUN,
  },
  emptyStringAsUndefined: true,
  skipValidation: process.env.SKIP_ENV_VALIDATION === '1',
});
