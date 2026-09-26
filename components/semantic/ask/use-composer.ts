"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import {
  postReply,
  postThread,
  type ChatField,
  type ChatFieldErrors,
  type MessageDraft,
  type PostStatus,
} from "@/lib/ask/client";
import { askConfig } from "@/lib/ask/config";
import { askFieldLimits, validateAskFields } from "@/lib/ask/fields";
import { askMessages } from "@/lib/ask/response";

import { useOwner } from "./owner-provider";
import { addPendingMessage } from "./pending-messages";

export const NAME_KEY = "hr.ask.name";

const minElapsedMs = askConfig.timeToSubmit.minMs;
export const { min: bodyMin, max: bodyMax } = askFieldLimits.body;

/** How long `justFiled` stays true after a send, for a settle-back flourish. */
const FILED_MS = 520;

export type ComposerStatus =
  | { kind: "idle" }
  | { kind: "error"; message: string; fieldErrors: ChatFieldErrors }
  | { kind: "sent"; status: PostStatus };

const idle: ComposerStatus = { kind: "idle" };

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * The server silently drops visitor messages sent sooner than `minMs` after
 * the composer mounted, so a fast human (a paste and a shortcut) is held back
 * until the window opens instead of losing the message. The owner skips the
 * bot checks server-side, so their messages go out at once.
 */
async function measureElapsed(
  mountedAt: number,
  owner: boolean
): Promise<number> {
  const early = minElapsedMs - (performance.now() - mountedAt);
  if (!owner && early > 0) await wait(early + 50);
  return Math.round(performance.now() - mountedAt);
}

function readStoredName(): string {
  try {
    return localStorage.getItem(NAME_KEY) ?? "";
  } catch {
    return "";
  }
}

function storeName(name: string) {
  try {
    if (name) localStorage.setItem(NAME_KEY, name);
    else localStorage.removeItem(NAME_KEY);
  } catch {
    // Remembering the name is a convenience; a blocked store just forgets it.
  }
}

const noopSubscribe = () => () => {};

/** Whether to show ⌘ rather than Ctrl in shortcut hints. False on the server. */
export function useIsApple() {
  return React.useSyncExternalStore(
    noopSubscribe,
    () => /Mac|iPhone|iPad/.test(navigator.userAgent),
    () => false
  );
}

export type AskComposerOptions = {
  /** Reply inside this thread; omit to start a new one. */
  slug?: string;
  collapsible?: boolean;
  autoFocus?: boolean;
  /** Called after a successful send. */
  onSent?: (status: PostStatus) => void;
  /** When set, Escape in an empty composer calls it. */
  onCancel?: () => void;
};

/**
 * Everything a new-thread or reply composer does except how it looks:
 * validation, the anti-bot timing, sending, pending echoes for visitors,
 * refresh for the owner, the remembered name, collapse and expand, keyboard
 * shortcuts and focus after errors. Visitors' messages wait for moderation;
 * the owner's publish at once.
 */
export function useAskComposer({
  slug,
  collapsible = false,
  autoFocus = false,
  onSent,
  onCancel,
}: AskComposerOptions) {
  const { owner } = useOwner();
  const router = useRouter();
  const id = React.useId();
  const [body, setBody] = React.useState("");
  const [status, setStatus] = React.useState<ComposerStatus>(idle);
  const [isSending, setIsSending] = React.useState(false);
  const [expanded, setExpanded] = React.useState(!collapsible);
  const [justFiled, setJustFiled] = React.useState(false);
  const mountedAt = React.useRef(0);
  const formRef = React.useRef<HTMLFormElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const nameRef = React.useRef<HTMLInputElement>(null);
  const errorRef = React.useRef<HTMLParagraphElement>(null);
  const isReply = slug !== undefined;
  const pointerDown = React.useRef(false);

  React.useEffect(() => {
    if (!collapsible) return;
    const down = () => (pointerDown.current = true);
    const up = () => (pointerDown.current = false);
    window.addEventListener("pointerdown", down, true);
    window.addEventListener("pointerup", up, true);
    window.addEventListener("pointercancel", up, true);
    return () => {
      window.removeEventListener("pointerdown", down, true);
      window.removeEventListener("pointerup", up, true);
      window.removeEventListener("pointercancel", up, true);
    };
  }, [collapsible]);

  React.useEffect(() => {
    mountedAt.current = performance.now();
    if (nameRef.current) nameRef.current.value = readStoredName();
    if (autoFocus) textareaRef.current?.focus();
  }, [autoFocus]);

  React.useEffect(() => {
    if (status.kind !== "error") return;
    // The disabled fieldset dropped focus while sending; put it back somewhere useful.
    const firstInvalid = formRef.current?.querySelector<HTMLElement>(
      "[aria-invalid='true']"
    );
    (firstInvalid ?? errorRef.current)?.focus();
  }, [status]);

  const fieldErrors = status.kind === "error" ? status.fieldErrors : {};
  const bodyError = fieldErrors.body?.[0];
  const nameError = fieldErrors.name?.[0];
  const ids = {
    body: `${id}-body`,
    bodyHint: `${id}-body-hint`,
    bodyError: `${id}-body-error`,
    name: `${id}-name`,
    nameHint: `${id}-name-hint`,
    nameError: `${id}-name-error`,
    website: `${id}-website`,
  };

  function clearFieldError(field: ChatField) {
    if (status.kind !== "error" || !status.fieldErrors[field]) return;
    const { [field]: _cleared, ...rest } = status.fieldErrors;
    setStatus({ ...status, fieldErrors: rest });
  }

  async function send(form: HTMLFormElement) {
    const data = new FormData(form);
    const text = (key: string) => {
      const value = data.get(key);
      return typeof value === "string" ? value : "";
    };
    const name = owner ? "" : text("name").trim();
    const fields = { body: text("body"), name, website: text("website") };

    const localErrors = validateAskFields(fields);
    if (Object.keys(localErrors).length > 0) {
      setStatus({
        kind: "error",
        message: askMessages.invalid,
        fieldErrors: localErrors,
      });
      return;
    }

    setIsSending(true);
    setStatus(idle);
    const draft: MessageDraft = {
      body: fields.body.trim(),
      ...(name && { name }),
      website: fields.website,
      elapsed: await measureElapsed(mountedAt.current, owner),
    };
    const result = isReply
      ? await postReply(slug, draft)
      : await postThread(draft);
    setIsSending(false);

    if (!result.ok) {
      setStatus({
        kind: "error",
        message: result.message,
        fieldErrors: result.fieldErrors ?? {},
      });
      return;
    }

    if (!owner) storeName(name);
    if (result.status === "pending") {
      addPendingMessage({
        slug: result.slug,
        ...(result.key && { key: result.key }),
        body: draft.body,
        ...(draft.name && { authorName: draft.name }),
        createdAt: new Date().toISOString(),
      });
    } else {
      router.refresh();
    }
    setBody("");
    mountedAt.current = performance.now();
    setStatus({ kind: "sent", status: result.status });
    setJustFiled(true);
    setTimeout(() => setJustFiled(false), FILED_MS);
    if (collapsible) setExpanded(false);
    onSent?.(result.status);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isSending) void send(event.currentTarget);
  }

  function handleBodyChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    setBody(event.target.value);
    if (status.kind === "sent") setStatus(idle);
    else clearFieldError("body");
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      formRef.current?.requestSubmit();
    } else if (event.key === "Escape" && body.trim() === "") {
      if (onCancel) {
        event.preventDefault();
        onCancel();
      } else if (collapsible) {
        event.preventDefault();
        setExpanded(false);
        setStatus(idle);
      }
    }
  }

  // An untouched composer folds back to its single line once focus leaves it.
  function handleBlur(event: React.FocusEvent<HTMLFormElement>) {
    if (!collapsible || body.trim() !== "") return;
    if (event.currentTarget.contains(event.relatedTarget)) return;
    const collapse = () => {
      setExpanded(false);
      setStatus((current) => (current.kind === "error" ? idle : current));
    };
    // Folding mid-click would pull whatever is being clicked out from under
    // the pointer, so wait until the click has landed.
    if (pointerDown.current) {
      window.addEventListener("pointerup", () => setTimeout(collapse), {
        once: true,
      });
    } else {
      collapse();
    }
  }

  return {
    owner,
    isReply,
    body,
    status,
    isSending,
    expanded,
    setExpanded,
    justFiled,
    ids,
    bodyError,
    nameError,
    /** A general error with no field to point at, or null. */
    summary:
      status.kind === "error" && !bodyError && !nameError && !isSending
        ? status.message
        : null,
    formRef,
    textareaRef,
    nameRef,
    errorRef,
    clearFieldError,
    handleSubmit,
    handleBodyChange,
    handleKeyDown,
    handleBlur,
  };
}

/** Joins aria-describedby ids, dropping the absent ones. */
export const describedBy = (...refs: (string | false | undefined)[]) =>
  refs.filter(Boolean).join(" ") || undefined;
