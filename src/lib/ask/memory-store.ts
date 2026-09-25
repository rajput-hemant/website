import 'server-only';
import { evaluate, parse } from 'groq-js';
import type { ClientReturn } from 'next-sanity';
import type { StoreDoc, StoreWrite } from './store';

declare global {
  var askMemoryDocs: StoreDoc[] | undefined;
}

const minutesAgo = (minutes: number) =>
  new Date(Date.now() - minutes * 60_000).toISOString();

function message(
  id: string,
  minutes: number,
  body: string,
  author: Record<string, unknown>,
  extra: Record<string, unknown> = {},
): StoreDoc {
  return {
    _id: id,
    _type: 'question',
    body,
    author: { _type: 'object', ...author },
    status: 'published',
    submittedAt: minutesAgo(minutes),
    publishedAt: minutesAgo(minutes),
    ...extra,
  };
}

const owner = { kind: 'dev', name: 'Hemant', providerId: 'dev:hemant' };
const priya = {
  kind: 'dev',
  name: 'Priya Sharma',
  providerId: 'dev:priya-sharma',
};
const anon = {
  kind: 'anonymous',
  name: 'Curious visitor',
  providerId: 'anon:fixture',
  avatarSeed: 'b7c1d2e3f4a5',
};
const thread = (id: string) => ({ _type: 'reference', _ref: id, _weak: true });

function fixtures(): StoreDoc[] {
  return [
    message(
      'fixture-q1',
      60 * 26,
      'How do you decide when a side project is worth **finishing**?',
      priya,
      {
        slug: { _type: 'slug', current: 'a1b2c3d4' },
        reactions: [
          {
            _key: 'heart-dev-hemant',
            emoji: 'heart',
            providerId: 'dev:hemant',
          },
        ],
      },
    ),
    message(
      'fixture-r1',
      60 * 25,
      'When I still think about it a week later. Most ideas fade; the ones that survive a week usually deserve a weekend.\n\nThe other test: can I ship a *useful* first version in two days?',
      owner,
      {
        thread: thread('fixture-q1'),
        reactions: [
          {
            _key: 'thumbsup-dev-priya-sharma',
            emoji: 'thumbsup',
            providerId: 'dev:priya-sharma',
          },
          {
            _key: 'party-dev-priya-sharma',
            emoji: 'party',
            providerId: 'dev:priya-sharma',
          },
        ],
      },
    ),
    message(
      'fixture-r2',
      60 * 24,
      'That two-day test is a good one, thanks!',
      priya,
      { thread: thread('fixture-q1') },
    ),
    message(
      'fixture-q2',
      60 * 5,
      'What does your terminal setup look like? Is `zsh` still worth it?',
      anon,
      { slug: { _type: 'slug', current: 'e5f6a7b8' } },
    ),
    message(
      'fixture-r3',
      60 * 4,
      'Still zsh, with very few plugins:\n\n```sh\nbrew install starship zoxide fzf\n```\n\nMore in the [dotfiles](https://github.com/rajput-hemant).',
      owner,
      { thread: thread('fixture-q2') },
    ),
    message('fixture-q3', 30, 'Hi Hemant, just saying hello.', priya, {
      slug: { _type: 'slug', current: 'c9d0e1f2' },
      deletedAt: minutesAgo(20),
      body: undefined,
    }),
  ];
}

function docs(): StoreDoc[] {
  globalThis.askMemoryDocs ??= fixtures();
  return globalThis.askMemoryDocs;
}

export async function memoryRead<const Query extends keyof SanityQueries>(
  query: Query,
  params: Record<string, unknown>,
): Promise<ClientReturn<Query, unknown>> {
  const value = await evaluate(parse(query), { dataset: docs(), params });
  return value.get();
}

export function memoryWrite(write: StoreWrite): void {
  const all = docs();
  if (write.op === 'create' || write.op === 'upsert') {
    const index = all.findIndex((doc) => doc._id === write.doc._id);
    if (index >= 0 && write.op === 'create') {
      throw new Error(`Document ${write.doc._id} already exists`);
    }
    if (index >= 0) all.splice(index, 1, write.doc);
    else all.push(write.doc);
    return;
  }

  const doc = all.find((candidate) => candidate._id === write.id);
  if (!doc) throw new Error(`Document ${write.id} not found`);

  if (write.op === 'patch') {
    Object.assign(doc, write.set);
    for (const field of write.unset ?? []) delete doc[field];
    return;
  }

  const current = Array.isArray(doc.reactions) ? doc.reactions : [];
  const kept = current.filter(
    (item: unknown) =>
      !(
        typeof item === 'object' &&
        item !== null &&
        '_key' in item &&
        item._key === write.item._key
      ),
  );
  doc.reactions = write.on ? [...kept, write.item] : kept;
}
