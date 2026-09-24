import { defineEnableDraftMode } from 'next-sanity/draft-mode';
import { serverEnv } from '~/env/server';
import { getClient } from '~/sanity/lib/client';

export async function GET(request: Request) {
  const client = await getClient();
  const handler = defineEnableDraftMode({
    client: client.withConfig({ token: serverEnv.SANITY_API_READ_TOKEN }),
  });
  return handler.GET(request);
}
