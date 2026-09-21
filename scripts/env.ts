import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const writeEnv = createEnv({
  server: {
    SANITY_API_WRITE_TOKEN: z.string().min(1),
  },
  runtimeEnv: {
    SANITY_API_WRITE_TOKEN: process.env.SANITY_API_WRITE_TOKEN,
  },
  emptyStringAsUndefined: true,
});
