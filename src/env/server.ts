import 'server-only';
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

const skipValidation = process.env.SKIP_ENV_VALIDATION === '1';

export const serverEnv = createEnv({
  server: {
    SANITY_API_READ_TOKEN: z.string().min(1),
    SANITY_API_WRITE_TOKEN: z.string().min(1),
  },
  runtimeEnv: {
    SANITY_API_READ_TOKEN: process.env.SANITY_API_READ_TOKEN,
    SANITY_API_WRITE_TOKEN: process.env.SANITY_API_WRITE_TOKEN,
  },
  emptyStringAsUndefined: true,
  skipValidation,
});
