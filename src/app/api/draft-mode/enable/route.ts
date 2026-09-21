import { defineEnableDraftMode } from 'next-sanity/draft-mode';
import { serverEnv } from '~/env/server';
import { draftModeClient } from '~/sanity/lib/client';

export const { GET } = defineEnableDraftMode({
  client: draftModeClient.withConfig({
    token: serverEnv.SANITY_API_READ_TOKEN,
  }),
});
