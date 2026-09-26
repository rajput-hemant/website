import { type AskField, type AskFieldErrors } from "@/lib/ask/fields";
import { type ModerationAction } from "@/lib/ask/moderation";
import {
  askMessages,
  type ModerateRequest,
  type PostStatus,
} from "@/lib/ask/response";
import { type ModerationItem } from "@/lib/data/types";

/**
 * Typed fetch client for the /ask chat endpoints (see the HTTP table in
 * `docs/ask.md`). Every call resolves to a result, never throws: network
 * failures and unexpected bodies become an `ApiError` with a readable message.
 */

export type { ModerateRequest, ModerationAction, PostStatus };
export type ChatField = AskField;
export type ChatFieldErrors = AskFieldErrors;

export type ApiError = {
  ok: false;
  /** HTTP status, or 0 when the request never reached the server. */
  status: number;
  message: string;
  fieldErrors?: ChatFieldErrors;
};

export type ApiResult<T> = ({ ok: true } & T) | ApiError;

export type MessageDraft = {
  body: string;
  name?: string;
  /** Honeypot; always empty from a person. */
  website: string;
  /** Milliseconds since the composer mounted, from `performance.now()`. */
  elapsed: number;
};

type Json = Record<string, unknown>;

const isObject = (value: unknown): value is Json =>
  typeof value === "object" && value !== null;

const isString = (value: unknown): value is string => typeof value === "string";

const isPostStatus = (value: unknown): value is PostStatus =>
  value === "pending" || value === "published";

const statusMessages: Record<number, string> = {
  401: "Your owner session has ended. Sign in again at /owner.",
  413: askMessages.tooLarge,
  429: "Too many attempts. Please wait a little and try again.",
};

function fieldErrorsFrom(value: unknown): ChatFieldErrors | undefined {
  if (!isObject(value)) return undefined;
  const errors: ChatFieldErrors = {};
  for (const field of ["body", "name"] as const) {
    const messages = value[field];
    if (Array.isArray(messages) && messages.every(isString)) {
      errors[field] = messages;
    }
  }
  return errors;
}

function errorFrom(status: number, data: unknown): ApiError {
  const message =
    isObject(data) && isString(data.message) && data.message
      ? data.message
      : (statusMessages[status] ?? askMessages.failed);
  const fieldErrors = isObject(data)
    ? fieldErrorsFrom(data.fieldErrors)
    : undefined;
  return { ok: false, status, message, ...(fieldErrors && { fieldErrors }) };
}

/** One JSON request; `read` narrows a 2xx body or returns null when it doesn't match. */
async function request<T>(
  path: string,
  init: { method: "GET" | "POST" | "DELETE"; body?: unknown },
  read: (data: Json) => T | null
): Promise<ApiResult<T>> {
  let response: Response;
  try {
    response = await fetch(path, {
      method: init.method,
      cache: "no-store",
      credentials: "same-origin",
      headers:
        init.body === undefined
          ? undefined
          : { "content-type": "application/json" },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
    });
  } catch {
    return { ok: false, status: 0, message: askMessages.failed };
  }

  let data: unknown = null;
  try {
    data = await response.json();
  } catch {
    // An empty or HTML body falls through to the status-based message.
  }

  if (!response.ok) return errorFrom(response.status, data);
  const value = isObject(data) ? read(data) : null;
  return value === null
    ? { ok: false, status: response.status, message: askMessages.failed }
    : { ok: true, ...value };
}

const readPost = (data: Json) =>
  data.ok === true && isString(data.slug) && isPostStatus(data.status)
    ? {
        slug: data.slug,
        status: data.status,
        key: isString(data.key) ? data.key : undefined,
      }
    : null;

const readOwner = (data: Json) =>
  typeof data.owner === "boolean" ? { owner: data.owner } : null;

/** Starts a thread. Published at once for the owner, pending for everyone else. */
export function postThread(draft: MessageDraft) {
  return request("/api/ask", { method: "POST", body: draft }, readPost);
}

/** Replies inside a published thread; the result carries the new reply's `key`. */
export function postReply(slug: string, draft: MessageDraft) {
  return request(
    `/api/ask/${encodeURIComponent(slug)}/replies`,
    { method: "POST", body: draft },
    readPost
  );
}

export function getOwnerSession() {
  return request("/api/owner/session", { method: "GET" }, readOwner);
}

export function signIn(passphrase: string) {
  return request(
    "/api/owner/session",
    { method: "POST", body: { passphrase } },
    readOwner
  );
}

export function signOut() {
  return request("/api/owner/session", { method: "DELETE" }, readOwner);
}

export function getModeration() {
  return request("/api/ask/moderation", { method: "GET" }, (data) =>
    data.ok === true && Array.isArray(data.items)
      ? { items: data.items as ModerationItem[] }
      : null
  );
}

export function moderate(body: ModerateRequest) {
  return request("/api/ask/moderate", { method: "POST", body }, (data) =>
    data.ok === true ? {} : null
  );
}
