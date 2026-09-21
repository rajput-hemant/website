import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

const skipValidation = process.env.SKIP_ENV_VALIDATION === '1';

export const clientEnv = createEnv({
  client: {
    NEXT_PUBLIC_SANITY_PROJECT_ID: z.string().min(1),
    NEXT_PUBLIC_SANITY_DATASET: z.string().min(1),
  },
  runtimeEnv: {
    NEXT_PUBLIC_SANITY_PROJECT_ID:
      process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ||
      (skipValidation ? 'buildtest' : undefined),
    NEXT_PUBLIC_SANITY_DATASET:
      process.env.NEXT_PUBLIC_SANITY_DATASET ||
      (skipValidation ? 'production' : undefined),
  },
  emptyStringAsUndefined: true,
  skipValidation,
});
