import type { ModerationItem } from "@/lib/data/types";

import { askConfig } from "./config";
import type { ModerationAction } from "./moderation";
import { type AskFieldErrors } from "./schema";

/**
 * JSON bodies of the /ask chat endpoints (see the HTTP table in `docs/ask.md`).
 * Types only plus `askMessages`, so client code can import this module.
 */

export type AskErrorResponse = {
  ok: false;
  message: string;
  /** Present on 400 responses caused by a visible field. */
  fieldErrors?: AskFieldErrors;
};

/** What a visitor sees: spam and discarded posts read as pending. */
export type PostStatus = "pending" | "published";

/** `POST /api/ask`: a new thread. */
export type AskPostSuccess = { ok: true; slug: string; status: PostStatus };
export type AskPostResponse = AskPostSuccess | AskErrorResponse;

/** `POST /api/ask/[slug]/replies`: `key` is the new reply's `_key`. */
export type ReplySuccess = {
  ok: true;
  slug: string;
  key: string;
  status: PostStatus;
};
export type ReplyResponse = ReplySuccess | AskErrorResponse;

/** `GET`, `POST` and `DELETE /api/owner/session` on success. */
export type OwnerSessionResponse = { owner: boolean };
/** `POST /api/owner/session` body. */
export type OwnerSignInRequest = { passphrase: string };
export type OwnerSignInResponse = OwnerSessionResponse | AskErrorResponse;

/** `GET /api/ask/moderation`: pending and recent spam, newest first. */
export type ModerationResponse =
  { ok: true; items: ModerationItem[] } | AskErrorResponse;

/** `POST /api/ask/moderate` body. */
export type ModerateRequest = {
  slug: string;
  /** `"thread"` for the opening message, otherwise the reply's `key`. */
  target: "thread" | (string & {});
  action: ModerationAction;
};
export type ModerateResponse = { ok: true } | AskErrorResponse;

export const askMessages = {
  invalid: "Please check the highlighted fields.",
  malformed:
    "Something about that request was off. Reload the page and try again.",
  expired:
    "This form has been open for a long time. Reload the page and try again.",
  tooLarge: "That message is too long to send.",
  pendingThread:
    "Your last conversation is still waiting for approval. You can start another once it's reviewed.",
  pendingReplies:
    "You have several replies waiting for approval. Please wait until they're reviewed.",
  replyCap: "You've replied a lot today. Please try again tomorrow.",
  dailyCap:
    "Too many messages have come from your connection today. Please try again tomorrow.",
  threadNotFound: "That conversation doesn't exist or isn't public yet.",
  unsupported: "This endpoint only accepts JSON from this site.",
  circuitOpen: "Not accepting new messages right now",
  notConfigured: "The inbox isn't connected yet",
  failed: "Something went wrong while sending. Please try again later.",
  ownerUnauthorized: "Sign in at /owner to do that.",
  ownerWrong: "That passphrase isn't right.",
  ownerLocked: `Too many wrong attempts. Try again in ${askConfig.owner.failedAttemptWindowMs / 60_000} minutes.`,
  ownerNotConfigured: "Owner sign-in isn't set up on this server.",
  moderationNotFound: "That message no longer exists.",
} as const;
