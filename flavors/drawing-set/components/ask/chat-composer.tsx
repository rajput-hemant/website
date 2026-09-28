"use client";

import { Button, Kbd } from "@/flavors/drawing-set/components/ui";
import { cn } from "@/flavors/drawing-set/lib/utils";
import { ArrowUp, Check, CircleAlert, LoaderCircle } from "lucide-react";

import { site } from "@/content/site";
import type { PostStatus } from "@/lib/ask/client";
import { askFieldLimits } from "@/lib/ask/fields";
import { emit } from "@/lib/scene/store";
import {
  bodyMax,
  bodyMin,
  describedBy,
  useAskComposer,
  useIsApple,
} from "@/components/semantic/ask/use-composer";

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
   * slip (with `expandedPlaceholder`) on focus or click. The label is then
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
 * The slip form: new threads and replies. Visitors' messages wait for
 * moderation and echo in place for the sender; the owner's publish at once.
 * On success the slip briefly settles back, as if just filed in the tray.
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
  const {
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
    summary,
    formRef,
    textareaRef,
    nameRef,
    errorRef,
    clearFieldError,
    handleSubmit,
    handleBodyChange,
    handleKeyDown,
    handleBlur,
  } = useAskComposer({
    slug,
    collapsible,
    autoFocus,
    onSent: (sent) => {
      emit({ type: "ask:sent" });
      onSent?.(sent);
    },
    onCancel,
  });

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      onBlur={handleBlur}
      noValidate
      aria-busy={isSending}
      className={cn("relative min-w-0", className)}
    >
      <fieldset disabled={isSending} className="grid min-w-0 gap-3">
        <label
          htmlFor={ids.body}
          className={
            hideLabel || collapsible
              ? "sr-only"
              : "font-display text-xl font-normal text-ink sm:text-2xl"
          }
        >
          {label}
        </label>

        {/* The slip: a ink card that settles back into place once it's filed. */}
        <div
          data-expanded={expanded || undefined}
          onClick={() => {
            if (!expanded) textareaRef.current?.focus();
          }}
          className={cn(
            "rounded-md border border-line-strong bg-sheet transition-all duration-(--duration-ui) ease-enter",
            !expanded && "cursor-text",
            "hover:border-ink-soft/50 has-[textarea:focus-visible]:border-accent has-[textarea:focus-visible]:ring-1 has-[textarea:focus-visible]:ring-accent",
            bodyError && "border-danger hover:border-danger",
            owner && "border-t-2 border-t-accent",
            justFiled &&
              "motion:translate-y-1 motion:scale-[0.985] motion:opacity-80"
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
            onChange={handleBodyChange}
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
              "block [field-sizing:content] max-h-80 w-full resize-none bg-transparent px-4 leading-relaxed text-ink placeholder:font-display placeholder:text-ink-soft/70 focus-visible:outline-none",
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
            className="flex flex-wrap items-center gap-x-3 gap-y-2 px-2 pt-1 pb-2 sm:pl-4"
          >
            {owner ? (
              <p className="flex min-w-0 flex-1 items-center gap-2 pl-2 text-xs text-ink-soft sm:pl-0">
                <span
                  aria-hidden
                  className="size-1.5 shrink-0 rounded-full bg-accent"
                />
                <span>
                  Posting as{" "}
                  <span className="font-medium text-ink">{site.handle}</span>{" "}
                  <span className="text-ink-faint">
                    (published immediately)
                  </span>
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
                  className="h-8 w-full min-w-0 rounded-sm bg-transparent px-2 text-sm text-ink placeholder:text-ink-soft hover:bg-sheet-deep focus-visible:bg-sheet-deep focus-visible:outline-offset-0 aria-invalid:text-danger sm:-ml-2"
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
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onCancel}
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                variant="primary"
                size="sm"
                magnetic
                className="press min-w-28 gap-1.5"
              >
                {isSending ? (
                  <>
                    <LoaderCircle aria-hidden className="animate-spin" />
                    Sending
                  </>
                ) : (
                  <>
                    {isReply ? "Reply" : "Send question"}
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

        <p className="font-mono text-mono-xs text-ink-faint">
          Messages are moderated before appearing. Nothing is public until
          it&rsquo;s approved.
        </p>
      </fieldset>

      {/* Always rendered: a live region added together with its text is often not announced. */}
      <div aria-live="polite" className="text-sm">
        {summary && (
          <p
            ref={errorRef}
            tabIndex={-1}
            className="mt-3 flex items-start gap-2 text-danger outline-none"
          >
            <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
            {summary}
          </p>
        )}
        {status.kind === "sent" && (
          <p className="mt-3 flex items-start gap-2 text-ink-soft">
            <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-accent" />
            {status.status === "published"
              ? "Published."
              : isReply
                ? "Reply filed. It will appear for everyone once it's approved."
                : "Filed. It will appear for everyone once it's approved."}
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
        "font-mono text-mono-xs tabular-nums transition-colors",
        length >= max * 0.9 ? "text-accent" : "text-ink-faint"
      )}
    >
      {length}/{max}
    </p>
  );
}

function SubmitHint() {
  const apple = useIsApple();

  return (
    <p className="hidden items-center gap-1 text-xs text-ink-faint fine:flex">
      <Kbd>{apple ? "⌘" : "Ctrl"}</Kbd>
      <Kbd>Enter</Kbd>
    </p>
  );
}
