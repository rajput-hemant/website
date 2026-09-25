import 'server-only';
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const askEnv = createEnv({
  server: {
    ASK_SUBMISSION_SECRET: z.string().min(32).optional(),
  },
  runtimeEnv: {
    ASK_SUBMISSION_SECRET: process.env.ASK_SUBMISSION_SECRET,
  },
  emptyStringAsUndefined: true,
  skipValidation: process.env.SKIP_ENV_VALIDATION === '1',
});
