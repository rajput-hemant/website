import { z } from "zod";

import type {
  ChatReply,
  MessageAuthor,
  MessageStatus,
  ModerationItem,
} from "@/lib/data/types";

import { isSlug } from "./slug";

/** Owner moderation: request parsing, status patches and the queue shape. Pure. */

export const moderationActions = ["publish", "reject", "spam"] as const;
export type ModerationAction = (typeof moderationActions)[number];

const actionStatus: Record<ModerationAction, MessageStatus> = {
  publish: "published",
  reject: "rejected",
  spam: "spam",
};

/**
 * Reply keys are interpolated into a JSONMatch path (`replies[_key=="…"]`),
 * so only URL-safe characters are accepted: UUIDs, Studio's random keys and
 * the legacy-answer key all fit.
 */
const REPLY_KEY_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

export function isReplyKey(value: string): boolean {
  return REPLY_KEY_PATTERN.test(value);
}

const moderateSchema = z.object({
  slug: z.string().refine(isSlug),
  target: z.string().refine((value) => value === "thread" || isReplyKey(value)),
  action: z.enum(moderationActions),
});

export type ModerateInput = z.output<typeof moderateSchema>;

export function parseModerateRequest(input: unknown): ModerateInput | null {
  const result = moderateSchema.safeParse(input);
  return result.success ? result.data : null;
}

/** What the moderate route reads before patching. */
export type ModerationThread = {
  _id: string;
  status: MessageStatus | null;
  publishedAt: string | null;
  replyKeys: string[] | null;
};

/**
 * The `set` patch for one moderation decision, or null when the reply key is
 * not in the thread. Publishing anything bumps `lastActivityAt` so the thread
 * rises to the top of the feed; a thread's first publish also sets `publishedAt`.
 */
export function buildModerationPatch(
  thread: ModerationThread,
  { target, action }: Pick<ModerateInput, "target" | "action">,
  now: string
): Record<string, unknown> | null {
  const status = actionStatus[action];
  const activity = action === "publish" ? { lastActivityAt: now } : {};

  if (target === "thread") {
    return {
      status,
      ...activity,
      ...(action === "publish" && !thread.publishedAt
        ? { publishedAt: now }
        : {}),
    };
  }

  if (!isReplyKey(target) || !thread.replyKeys?.includes(target)) return null;
  return { [`replies[_key=="${target}"].status`]: status, ...activity };
}

/** Raw rows from the moderation queue query (see `lib/ask/store.ts`). */
export type ModerationQueueRows = {
  threads: {
    slug: string | null;
    body: string | null;
    authorName: string | null;
    submittedAt: string | null;
    status: MessageStatus | null;
  }[];
  replies: {
    slug: string | null;
    body: string | null;
    replies:
      | {
          _key: string | null;
          by: MessageAuthor | null;
          authorName: string | null;
          body: string | null;
          createdAt: string | null;
          status: MessageStatus | null;
        }[]
      | null;
  }[];
};

const itemTime = (item: ModerationItem) =>
  Date.parse(item.kind === "thread" ? item.submittedAt : item.reply.createdAt);

/** Flattens the queue into threads and replies, newest first. */
export function toModerationItems(rows: ModerationQueueRows): ModerationItem[] {
  const threads = rows.threads.flatMap((row): ModerationItem[] =>
    row.slug && row.body && row.submittedAt
      ? [
          {
            kind: "thread",
            slug: row.slug,
            body: row.body,
            authorName: row.authorName ?? undefined,
            submittedAt: row.submittedAt,
            status: row.status ?? "pending",
          },
        ]
      : []
  );

  const replies = rows.replies.flatMap(({ slug, body, replies }) =>
    (replies ?? []).flatMap((reply): ModerationItem[] => {
      if (!slug || !reply._key || !reply.body || !reply.createdAt) return [];
      const chatReply: ChatReply = {
        key: reply._key,
        by: reply.by ?? "visitor",
        authorName: reply.authorName ?? undefined,
        body: reply.body,
        createdAt: reply.createdAt,
        status: reply.status ?? "pending",
      };
      return [
        { kind: "reply", slug, threadBody: body ?? "", reply: chatReply },
      ];
    })
  );

  return [...threads, ...replies].sort((a, b) => itemTime(b) - itemTime(a));
}
