import 'server-only';
import NextAuth from 'next-auth';
import type { Provider } from 'next-auth/providers';
import Credentials from 'next-auth/providers/credentials';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';
import { z } from 'zod';
import { authEnv, devLoginEnabled } from '~/env/auth';
import { askConfig } from '~/lib/ask/config';

const devLoginSchema = z.object({
  name: z.string().trim().min(1).max(askConfig.name.max),
});

function providers(): Provider[] {
  const list: Provider[] = [];

  if (authEnv.AUTH_GITHUB_ID && authEnv.AUTH_GITHUB_SECRET) {
    list.push(
      GitHub({
        clientId: authEnv.AUTH_GITHUB_ID,
        clientSecret: authEnv.AUTH_GITHUB_SECRET,
      }),
    );
  }

  if (authEnv.AUTH_GOOGLE_ID && authEnv.AUTH_GOOGLE_SECRET) {
    list.push(
      Google({
        clientId: authEnv.AUTH_GOOGLE_ID,
        clientSecret: authEnv.AUTH_GOOGLE_SECRET,
      }),
    );
  }

  if (devLoginEnabled) {
    list.push(
      Credentials({
        id: 'dev',
        name: 'Dev login',
        credentials: { name: { label: 'Name' } },
        authorize: (credentials) => {
          const parsed = devLoginSchema.safeParse(credentials);
          if (!parsed.success) return null;
          const id = parsed.data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          return id ? { id, name: parsed.data.name } : null;
        },
      }),
    );
  }

  return list;
}

export const { handlers, auth } = NextAuth({
  ...(authEnv.AUTH_SECRET ? { secret: authEnv.AUTH_SECRET } : {}),
  providers: providers(),
  session: { strategy: 'jwt' },
  callbacks: {
    jwt({ token, account }) {
      if (account) {
        token.providerId = `${account.provider}:${account.providerAccountId}`;
      }
      return token;
    },
    session({ session, token }) {
      if (typeof token.providerId === 'string') {
        session.user.id = token.providerId;
      }
      return session;
    },
  },
});
