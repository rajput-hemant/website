import 'server-only';
import { connection } from 'next/server';
import type { ClientReturn } from 'next-sanity';
import { authEnv } from '~/env/auth';
import { serverEnv } from '~/env/server';
import { askConfig } from '~/lib/ask/config';
import { excerpt } from '~/lib/ask/display';
import { countReactions } from '~/lib/ask/limits';
import { memoryRead } from '~/lib/ask/memory-store';
import {
  ASK_THREAD_INDEX_QUERY,
  ASK_THREAD_PAGE_QUERY,
  ASK_THREAD_QUERY,
} from '~/lib/ask/queries';
import type {
  AuthorKind,
  PublicAuthor,
  Thread,
  ThreadMessage,
  ThreadPage,
} from '~/lib/ask/types';
import { sanityFetch } from '~/sanity/lib/live';

async function publicRead<const Query extends keyof SanityQueries>(
  query: Query,
  params: Record<string, unknown>,
): Promise<ClientReturn<Query, unknown>> {
  if (serverEnv.SANITY_WRITE_DRY_RUN) {
    await connection();
    return memoryRead(query, params);
  }
  const { data } = await sanityFetch({
    query,
    params,
    stega: false,
    tags: [askConfig.cacheTag],
  });
  return data;
}

type RawAuthor = {
  kind: string | null;
  name: string | null;
  avatarUrl: string | null;
  avatarSeed: string | null;
  isOwner: boolean | null;
} | null;

const AUTHOR_KINDS: readonly AuthorKind[] = [
  'anonymous',
  'github',
  'google',
  'dev',
];

function toAuthor(raw: RawAuthor, isThreadAuthor: boolean): PublicAuthor {
  return {
    kind: AUTHOR_KINDS.find((kind) => kind === raw?.kind) ?? 'anonymous',
    name: raw?.name ?? null,
    avatarUrl: raw?.avatarUrl ?? null,
    avatarSeed: raw?.avatarSeed ?? null,
    isOwner: raw?.isOwner ?? false,
    isThreadAuthor,
  };
}

type RawMessage = {
  _id: string;
  body: string | null;
  submittedAt: string | null;
  editedAt: string | null;
  deletedAt: string | null;
  author: RawAuthor;
  reactions: (string | null)[] | null;
};

function toMessage(raw: RawMessage, isThreadAuthor: boolean): ThreadMessage {
  const deleted = Boolean(raw.deletedAt);
  return {
    id: raw._id,
    body: deleted ? null : raw.body,
    author: toAuthor(raw.author, isThreadAuthor),
    createdAt: raw.submittedAt ?? '',
    editedAt: raw.editedAt,
    deleted,
    reactions: deleted
      ? []
      : countReactions((raw.reactions ?? []).filter((key) => key !== null)),
  };
}

export async function getThreadPage(page: number): Promise<ThreadPage> {
  const size = askConfig.threadsPerPage;
  const current = Math.max(1, Math.floor(page));
  const { total, threads } = await publicRead(ASK_THREAD_PAGE_QUERY, {
    ownerIds: authEnv.ASK_OWNER_IDS,
    start: (current - 1) * size,
    end: current * size,
  });

  return {
    page: current,
    pageCount: Math.max(1, Math.ceil(total / size)),
    threads: threads.flatMap((thread) =>
      thread.slug
        ? [
            {
              id: thread._id,
              slug: thread.slug,
              excerpt: thread.body ? excerpt(thread.body) : null,
              author: toAuthor(thread.author, true),
              createdAt: thread.submittedAt ?? '',
              replyCount: thread.replyCount,
              lastActivityAt: thread.lastActivityAt ?? thread.submittedAt ?? '',
            },
          ]
        : [],
    ),
  };
}

export async function getThread(slug: string): Promise<Thread | null> {
  const thread = await publicRead(ASK_THREAD_QUERY, {
    slug,
    ownerIds: authEnv.ASK_OWNER_IDS,
  });
  if (!thread?.slug) return null;

  return {
    id: thread._id,
    slug: thread.slug,
    createdAt: thread.submittedAt ?? '',
    messages: [
      toMessage(thread, true),
      ...thread.replies.map((reply) => toMessage(reply, reply.isThreadAuthor)),
    ],
  };
}

export async function getThreadIndex(): Promise<
  { slug: string; excerpt: string | null; lastActivityAt: string }[]
> {
  const threads = await publicRead(ASK_THREAD_INDEX_QUERY, {});
  return threads.flatMap(({ slug, body, lastActivityAt }) =>
    slug
      ? [
          {
            slug,
            excerpt: body ? excerpt(body) : null,
            lastActivityAt: lastActivityAt ?? '',
          },
        ]
      : [],
  );
}
