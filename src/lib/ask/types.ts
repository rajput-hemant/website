import type { ReactionKey } from './config';

export type AuthorKind = 'anonymous' | 'github' | 'google' | 'dev';

export type MessageStatus = 'pending' | 'published' | 'hidden' | 'spam';

export type PublicAuthor = {
  kind: AuthorKind;
  name: string | null;
  avatarUrl: string | null;
  avatarSeed: string | null;
  isOwner: boolean;
  isThreadAuthor: boolean;
};

export type ReactionCount = { key: ReactionKey; count: number };

export type ThreadMessage = {
  id: string;
  body: string | null;
  author: PublicAuthor;
  createdAt: string;
  editedAt: string | null;
  deleted: boolean;
  reactions: ReactionCount[];
};

export type Thread = {
  id: string;
  slug: string;
  createdAt: string;
  messages: ThreadMessage[];
};

export type ThreadSummary = {
  id: string;
  slug: string;
  excerpt: string | null;
  author: PublicAuthor;
  createdAt: string;
  replyCount: number;
  lastActivityAt: string;
};

export type ThreadPage = {
  threads: ThreadSummary[];
  page: number;
  pageCount: number;
};

export type Viewer =
  | { kind: 'anonymous'; avatarSeed: string | null }
  | {
      kind: 'signed-in';
      provider: Exclude<AuthorKind, 'anonymous'>;
      name: string | null;
      image: string | null;
      isOwner: boolean;
    };

export type HeldMessage = {
  id: string;
  body: string;
  name: string | null;
  avatarSeed: string | null;
  createdAt: string;
  threadSlug: string | null;
};

export type OwnMessage = { id: string; body: string; createdAt: string };

export type ViewerState = {
  viewer: Viewer;
  mine: OwnMessage[];
  held: HeldMessage[];
  reacted: { id: string; keys: ReactionKey[] }[];
};

export type PostResult =
  | { status: 'published'; slug: string; id: string }
  | { status: 'held'; message: HeldMessage };

export type ApiError = { error: string };
