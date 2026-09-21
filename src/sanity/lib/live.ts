import 'server-only';
import { draftMode } from 'next/headers';
import type { ClientReturn } from '@sanity/client';
import { serverEnv } from '~/env/server';
import { client } from './client';

const draftClient = client.withConfig({
  token: serverEnv.SANITY_API_READ_TOKEN,
  useCdn: false,
});

export async function sanityFetch<const Query extends string>(
  query: Query,
  tags: readonly string[],
): Promise<ClientReturn<Query, unknown>> {
  const { isEnabled } = await draftMode();

  if (isEnabled) {
    return draftClient.fetch(
      query,
      {},
      {
        cache: 'no-store',
        perspective: 'drafts',
        stega: false,
      },
    );
  }

  return client.fetch(
    query,
    {},
    {
      cache: 'force-cache',
      next: { tags: [...tags] },
      perspective: 'published',
      stega: false,
    },
  );
}
