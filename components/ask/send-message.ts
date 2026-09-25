import { askConfig } from "@/lib/ask/config";
import { askMessages, type AskResponse } from "@/lib/ask/response";
import {
  parseAskInput,
  type AskFieldErrors,
  type AskInput,
} from "@/lib/ask/schema";

export type AskFormState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string; fieldErrors: AskFieldErrors };

export type AskDraft = {
  body: string;
  name: string;
  email: string;
  website: string;
  /** `performance.now()` when the form mounted. */
  mountedAt: number;
};

const minElapsedMs = askConfig.timeToSubmit.minMs;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * The server silently drops anything sent sooner than `minMs` after the form
 * mounted, so a fast human (a paste and a shortcut) is held back until the
 * window opens instead of losing the message.
 */
async function measureElapsed(mountedAt: number): Promise<number> {
  const early = minElapsedMs - (performance.now() - mountedAt);
  if (early > 0) await wait(early + 50);
  return Math.round(performance.now() - mountedAt);
}

function isAskResponse(value: unknown): value is AskResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    "ok" in value &&
    typeof value.ok === "boolean"
  );
}

async function readResponse(response: Response): Promise<AskResponse | null> {
  try {
    const data: unknown = await response.json();
    return isAskResponse(data) ? data : null;
  } catch {
    return null;
  }
}

const error = (
  message: string,
  fieldErrors: AskFieldErrors = {}
): AskFormState => ({ status: "error", message, fieldErrors });

/** Client action for `useActionState`: validates locally, then posts to `/api/ask`. */
export async function sendMessage(
  _previous: AskFormState,
  { mountedAt, ...fields }: AskDraft
): Promise<AskFormState> {
  const local = parseAskInput({ ...fields, elapsed: minElapsedMs });
  if (!local.success && Object.keys(local.fieldErrors).length > 0) {
    return error(askMessages.invalid, local.fieldErrors);
  }

  const payload: AskInput = {
    ...fields,
    elapsed: await measureElapsed(mountedAt),
  };

  let response: Response;
  try {
    response = await fetch("/api/ask", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    return error(askMessages.failed);
  }

  const data = await readResponse(response);
  if (response.ok && data?.ok) return { status: "success" };
  if (data && !data.ok) return error(data.message, data.fieldErrors);
  return error(
    response.status === 413 ? askMessages.tooLarge : askMessages.failed
  );
}
