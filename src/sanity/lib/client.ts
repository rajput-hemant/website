import { createClient } from 'next-sanity';

export async function getClient() {
  const { apiVersion, dataset, projectId } = await import('../env');

  return createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
  });
}
