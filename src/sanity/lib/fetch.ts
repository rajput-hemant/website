import 'server-only';
import { draftMode } from 'next/headers';
import { serverEnv } from '~/env/server';
import { getClient } from './client';

export async function sanityFetch<const Query extends keyof SanityQueries>(
  query: Query,
  tags: readonly string[],
): Promise<SanityQueries[Query]> {
  const { isEnabled } = await draftMode();
  const client = await getClient();

  if (isEnabled) {
    return client
      .withConfig({ token: serverEnv.SANITY_API_READ_TOKEN })
      .fetch<SanityQueries[Query]>(
        query,
        {},
        {
          cache: 'no-store',
          perspective: 'drafts',
        },
      );
  }

  return client.fetch<SanityQueries[Query]>(
    query,
    {},
    {
      cache: 'force-cache',
      next: { tags: [...tags] },
      perspective: 'published',
    },
  );
}
