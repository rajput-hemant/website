import { createClient } from '@sanity/client';
import { createClient as createNextSanityClient } from 'next-sanity';
import { apiVersion, dataset, projectId } from '../env';

const config = {
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: 'published',
  stega: {
    studioUrl: '/studio',
  },
} as const;

export const client = createClient(config);

// The draft helper requires the nominal client type bundled with next-sanity.
export const draftModeClient = createNextSanityClient(config);
