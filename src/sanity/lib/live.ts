import { createClient } from 'next-sanity';
import { defineLive } from 'next-sanity/live';
import { apiVersion, dataset, projectId } from '../env';

export const { sanityFetch, SanityLive } = defineLive({
  client: createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: true,
    perspective: 'published',
  }),
  serverToken: false,
  browserToken: false,
});
