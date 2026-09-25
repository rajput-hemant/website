import 'server-only';
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

const accountId = z.string().regex(/^(github|google|dev):[\w-]+$/);

export const authEnv = createEnv({
  server: {
    AUTH_SECRET: z.string().min(32).optional(),
    AUTH_GITHUB_ID: z.string().min(1).optional(),
    AUTH_GITHUB_SECRET: z.string().min(1).optional(),
    AUTH_GOOGLE_ID: z.string().min(1).optional(),
    AUTH_GOOGLE_SECRET: z.string().min(1).optional(),
    AUTH_DEV_LOGIN: z
      .enum(['0', '1'])
      .default('0')
      .transform((value) => value === '1'),
    ASK_OWNER_IDS: z
      .string()
      .default('')
      .transform((value) =>
        value
          .split(',')
          .map((id) => id.trim())
          .filter(Boolean),
      )
      .pipe(z.array(accountId)),
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('production'),
  },
  runtimeEnv: {
    AUTH_SECRET: process.env.AUTH_SECRET,
    AUTH_GITHUB_ID: process.env.AUTH_GITHUB_ID,
    AUTH_GITHUB_SECRET: process.env.AUTH_GITHUB_SECRET,
    AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID,
    AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET,
    AUTH_DEV_LOGIN: process.env.AUTH_DEV_LOGIN,
    ASK_OWNER_IDS: process.env.ASK_OWNER_IDS,
    NODE_ENV: process.env.NODE_ENV,
  },
  emptyStringAsUndefined: true,
  skipValidation: process.env.SKIP_ENV_VALIDATION === '1',
});

export const devLoginEnabled =
  authEnv.NODE_ENV === 'development' && authEnv.AUTH_DEV_LOGIN;
