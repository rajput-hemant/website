import 'server-only';
import { authEnv, devLoginEnabled } from '~/env/auth';

export type SignInOptions = { github: boolean; google: boolean; dev: boolean };

export function getSignInOptions(): SignInOptions {
  return {
    github: Boolean(authEnv.AUTH_GITHUB_ID && authEnv.AUTH_GITHUB_SECRET),
    google: Boolean(authEnv.AUTH_GOOGLE_ID && authEnv.AUTH_GOOGLE_SECRET),
    dev: devLoginEnabled,
  };
}
