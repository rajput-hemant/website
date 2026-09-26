"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/flavors/minimal/components/ui/button";
import { Kbd } from "@/flavors/minimal/components/ui/kbd";
import { cn } from "@/flavors/minimal/lib/utils";
import { ArrowUp, Check, CircleAlert, LoaderCircle } from "lucide-react";

import { site } from "@/content/site";
import { askConfig } from "@/lib/ask/config";
import { askFieldLimits, validateAskFields } from "@/lib/ask/fields";
import { askMessages } from "@/lib/ask/response";

import {
  postReply,
  postThread,
  type ChatField,
  type ChatFieldErrors,
  type MessageDraft,
  type PostStatus,
} from "./api";
import { useOwner } from "./owner-provider";
import { addPendingMessage } from "./pending-messages";

export const NAME_KEY = "hr.ask.name";

const ownerFirstName = site.name.split(" ")[0] ?? site.name;
const minElapsedMs = askConfig.timeToSubmit.minMs;
const { min: bodyMin, max: bodyMax } = askFieldLimits.body;

type ComposerStatus =
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

function useIsApple() {
  return React.useSyncExternalStore(
    noopSubscribe,
    () => /Mac|iPhone|iPad/.test(navigator.userAgent),
    () => false
  );
}

export type ChatComposerProps = {
  /** Reply inside this thread; omit to start a new one. */
  slug?: string;
  /** The textarea's label. */
  label: string;
  /** Keep the label for screen readers only. */
  hideLabel?: boolean;
  placeholder: string;
  /**
   * Rest as a single line that reads `placeholder`, expanding into the full
   * composer (with `expandedPlaceholder`) on focus or click. The label is then
   * for screen readers only.
   */
  collapsible?: boolean;
  expandedPlaceholder?: string;
  autoFocus?: boolean;
  /** Called after a successful send, e.g. to collapse an inline reply. */
  onSent?: (status: PostStatus) => void;
  /** Shows a Cancel button (and lets Escape close an empty composer). */
  onCancel?: () => void;
  className?: string;
};

/**
 * Composer for new threads and replies. Visitors' messages wait for
 * moderation and echo in place for the sender; the owner's publish at once.
 */
export function ChatComposer({
  slug,
  label,
  hideLabel = false,
  placeholder,
  collapsible = false,
  expandedPlaceholder = placeholder,
  autoFocus = false,
  onSent,
  onCancel,
  className,
}: ChatComposerProps) {
  const { owner } = useOwner();
  const router = useRouter();
  const id = React.useId();
  const [body, setBody] = React.useState("");
  const [status, setStatus] = React.useState<ComposerStatus>(idle);
  const [isSending, setIsSending] = React.useState(false);
  const [expanded, setExpanded] = React.useState(!collapsible);
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
  const errorFor = (field: ChatField) => fieldErrors[field]?.[0];
  const ids = {
    body: `${id}-body`,
    bodyHint: `${id}-body-hint`,
    bodyError: `${id}-body-error`,
    name: `${id}-name`,
    nameHint: `${id}-name-hint`,
    nameError: `${id}-name-error`,
    website: `${id}-website`,
  };
  const describedBy = (...refs: (string | false | undefined)[]) =>
    refs.filter(Boolean).join(" ") || undefined;

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
    if (collapsible) setExpanded(false);
    onSent?.(result.status);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isSending) void send(event.currentTarget);
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

  const bodyError = errorFor("body");
  const nameError = errorFor("name");
  const showSummary =
    status.kind === "error" && !bodyError && !nameError && !isSending;

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      onBlur={handleBlur}
      noValidate
      aria-busy={isSending}
      className={cn("relative min-w-0", className)}
    >
      <fieldset disabled={isSending} className="grid min-w-0 gap-2.5">
        <label
          htmlFor={ids.body}
          className={
            hideLabel || collapsible
              ? "sr-only"
              : "display text-xl font-book text-foreground sm:text-2xl"
          }
        >
          {label}
        </label>

        <div
          data-expanded={expanded || undefined}
          onClick={() => {
            if (!expanded) textareaRef.current?.focus();
          }}
          className={cn(
            "rounded-lg border border-border bg-background transition-[border-color,box-shadow] duration-(--duration-exit)",
            !expanded && "cursor-text",
            "hover:border-foreground/20 has-[textarea:focus-visible]:border-accent has-[textarea:focus-visible]:ring-1 has-[textarea:focus-visible]:ring-accent",
            bodyError && "border-danger hover:border-danger",
            owner && "bg-accent-soft/40"
          )}
        >
          <textarea
            ref={textareaRef}
            id={ids.body}
            name="body"
            rows={expanded ? (isReply ? 2 : 3) : 1}
            required
            maxLength={bodyMax}
            value={body}
            onChange={(event) => {
              setBody(event.target.value);
              if (status.kind === "sent") setStatus(idle);
              else clearFieldError("body");
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setExpanded(true)}
            placeholder={expanded ? expandedPlaceholder : placeholder}
            aria-invalid={bodyError ? true : undefined}
            aria-describedby={describedBy(
              ids.bodyHint,
              bodyError && ids.bodyError
            )}
            className={cn(
              // field-sizing grows it with its content up to the cap, then it scrolls; where unsupported, `rows` sets a fixed height.
              "block field-sizing-content max-h-80 w-full resize-none bg-transparent px-4 leading-relaxed text-foreground placeholder:text-subtle focus-visible:outline-none",
              !expanded
                ? "min-h-12 py-3 text-base leading-6"
                : isReply
                  ? "min-h-18 pt-3 pb-1 text-base"
                  : "min-h-24 pt-3 pb-1 text-base sm:text-lg"
            )}
          />
          <p id={ids.bodyHint} className="sr-only">
            Between {bodyMin} and {bodyMax} characters. Press Control or Command
            with Enter to send.{" "}
            {owner
              ? "Your message is published immediately."
              : "Messages appear after they are approved."}
          </p>

          <div
            hidden={!expanded}
            className="flex animate-in flex-wrap items-center gap-x-3 gap-y-2 px-2 pt-1 pb-2 duration-(--duration-enter) ease-enter fade-in-0 sm:pl-4"
          >
            {owner ? (
              <p className="flex min-w-0 flex-1 items-center gap-2 pl-2 text-xs text-muted sm:pl-0">
                <span
                  aria-hidden
                  className="size-1.5 shrink-0 rounded-full bg-accent"
                />
                <span>
                  Posting as{" "}
                  <span className="font-medium text-foreground">
                    {ownerFirstName}
                  </span>{" "}
                  <span className="text-subtle">(published immediately)</span>
                </span>
              </p>
            ) : (
              <div className="min-w-0 flex-1 basis-40">
                <label htmlFor={ids.name} className="sr-only">
                  Your name (optional)
                </label>
                <input
                  ref={nameRef}
                  id={ids.name}
                  name="name"
                  type="text"
                  autoComplete="name"
                  maxLength={askFieldLimits.name.max}
                  placeholder="Your name (optional)"
                  onChange={() => clearFieldError("name")}
                  aria-invalid={nameError ? true : undefined}
                  aria-describedby={describedBy(
                    ids.nameHint,
                    nameError && ids.nameError
                  )}
                  className="h-8 w-full min-w-0 rounded-sm bg-transparent px-2 text-sm text-foreground placeholder:text-subtle hover:bg-surface focus-visible:bg-surface focus-visible:outline-offset-0 aria-invalid:text-danger sm:-ml-2"
                />
                <p id={ids.nameHint} className="sr-only">
                  Shown with your message. Leave it empty to stay anonymous.
                </p>
              </div>
            )}

            <div className="ml-auto flex items-center gap-3">
              <BodyCounter length={body.length} max={bodyMax} />
              <SubmitHint />
              {onCancel && (
                <Button variant="ghost" size="sm" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                variant="accent"
                size="sm"
                className="min-w-20 gap-1.5"
              >
                {isSending ? (
                  <>
                    <LoaderCircle aria-hidden className="animate-spin" />
                    Sending
                  </>
                ) : (
                  <>
                    {isReply ? "Reply" : "Send"}
                    <ArrowUp aria-hidden strokeWidth={2} />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Hidden from people; anything typed here marks the request as automated. */}
        <div
          aria-hidden
          className="absolute -left-[9999px] size-px overflow-hidden"
        >
          <label htmlFor={ids.website}>Website</label>
          <input
            id={ids.website}
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            defaultValue=""
          />
        </div>

        <FieldError id={ids.bodyError} message={bodyError} />
        <FieldError id={ids.nameError} message={nameError} />
      </fieldset>

      {/* Always rendered: a live region added together with its text is often not announced. */}
      <div aria-live="polite" className="text-sm">
        {showSummary && (
          <p
            ref={errorRef}
            tabIndex={-1}
            className="mt-3 flex items-start gap-2 text-danger outline-none"
          >
            <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
            {status.message}
          </p>
        )}
        {status.kind === "sent" && (
          <p className="mt-3 flex items-start gap-2 text-muted">
            <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-accent" />
            {status.status === "published"
              ? "Published."
              : isReply
                ? "Reply sent. It will appear for everyone once it's approved."
                : "Sent. It will appear for everyone once it's approved."}
          </p>
        )}
      </div>
    </form>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="flex items-start gap-2 text-sm text-danger">
      <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
      {message}
    </p>
  );
}

function BodyCounter({ length, max }: { length: number; max: number }) {
  if (length === 0) return null;
  return (
    <p
      aria-hidden
      className={cn(
        "meta tabular-nums transition-colors",
        length >= max * 0.9 ? "text-accent" : "text-subtle"
      )}
    >
      {length}/{max}
    </p>
  );
}

function SubmitHint() {
  const apple = useIsApple();

  return (
    <p
      aria-hidden
      className="hidden items-center gap-1 text-xs text-subtle sm:pointer-fine:flex"
    >
      <Kbd>{apple ? "⌘" : "Ctrl"}</Kbd>
      <Kbd>Enter</Kbd>
    </p>
  );
}
