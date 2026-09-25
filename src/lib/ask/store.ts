import 'server-only';
import { cacheLife } from 'next/cache';
import { createClient, type ClientReturn } from 'next-sanity';
import { serverEnv } from '~/env/server';
import { apiVersion, dataset, projectId } from '~/sanity/env';
import { askConfig } from './config';
import { memoryRead, memoryWrite } from './memory-store';
import { ASK_PENDING_COUNT_QUERY } from './queries';

export type StoreDoc = { _id: string; _type: string } & Record<string, unknown>;

export type ReactionItem = {
  _key: string;
  emoji: string;
  providerId: string;
};

export type StoreWrite =
  | { op: 'create'; doc: StoreDoc }
  | { op: 'upsert'; doc: StoreDoc }
  | {
      op: 'patch';
      id: string;
      set: Record<string, unknown>;
      unset?: string[];
    }
  | { op: 'reaction'; id: string; item: ReactionItem; on: boolean };

function client(token: string) {
  return createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    token,
  });
}

export async function storeRead<const Query extends keyof SanityQueries>(
  query: Query,
  params: Record<string, unknown>,
): Promise<ClientReturn<Query, unknown>> {
  if (serverEnv.SANITY_WRITE_DRY_RUN) return memoryRead(query, params);
  return client(serverEnv.SANITY_API_READ_TOKEN).fetch(query, params);
}

export async function storeWrite(write: StoreWrite): Promise<void> {
  if (serverEnv.SANITY_WRITE_DRY_RUN) {
    memoryWrite(write);
    return;
  }

  const writer = client(serverEnv.SANITY_API_WRITE_TOKEN);
  switch (write.op) {
    case 'create':
      await writer.create(write.doc);
      return;
    case 'upsert':
      await writer.createOrReplace(write.doc);
      return;
    case 'patch':
      await writer
        .patch(write.id)
        .set(write.set)
        .unset(write.unset ?? [])
        .commit();
      return;
    case 'reaction': {
      const selector = `reactions[_key == "${write.item._key}"]`;
      const patch = writer.patch(write.id).unset([selector]);
      await (
        write.on
          ? patch
              .setIfMissing({ reactions: [] })
              .append('reactions', [write.item])
          : patch
      ).commit();
      return;
    }
  }
}

async function cachedPendingCount(): Promise<number> {
  'use cache';
  cacheLife({ revalidate: askConfig.circuitBreaker.cacheLifeSeconds });

  return createClient({ projectId, dataset, apiVersion, useCdn: true }).fetch(
    ASK_PENDING_COUNT_QUERY,
  );
}

export async function getPendingCount(): Promise<number> {
  if (serverEnv.SANITY_WRITE_DRY_RUN) {
    return memoryRead(ASK_PENDING_COUNT_QUERY, {});
  }
  return cachedPendingCount();
}
