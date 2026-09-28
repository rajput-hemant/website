"use client";

import { Button } from "@/flavors/survey/components/ui/button";
import { Kbd } from "@/flavors/survey/components/ui/kbd";
import { cn } from "@/flavors/survey/lib/utils";
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
  /** Reply inside this entry; omit to start a new one. */
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
 * The notebook form: new questions and replies. Visitors' notes wait for
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
            hideLabel || collapsible ? "sr-only" : "spaced text-h3 text-ink"
          }
        >
          {label}
        </label>

        {/* The sheet settles back into place once a note is sent. */}
        <div
          data-expanded={expanded || undefined}
          onClick={() => {
            if (!expanded) textareaRef.current?.focus();
          }}
          className={cn(
            "rounded-sm border border-rule-strong bg-sheet transition-[border-color,translate,scale,opacity] duration-(--duration-ui) ease-enter",
            !expanded && "cursor-text",
            "has-[textarea:focus-visible]:outline-2 has-[textarea:focus-visible]:outline-offset-2 has-[textarea:focus-visible]:outline-water fine:hover:border-water",
            bodyError && "border-danger",
            owner && "border-l-2 border-l-revision",
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
              // field-sizing grows it with its content up to the cap; where unsupported, `rows` sets a fixed height.
              "block [field-sizing:content] max-h-80 w-full resize-none bg-transparent px-4 leading-relaxed text-ink placeholder:text-ink-faint focus-visible:outline-none",
              !expanded
                ? "min-h-12 py-3 text-base leading-6"
                : isReply
                  ? "min-h-18 pt-3 pb-1 text-base"
                  : "min-h-24 pt-3 pb-1 font-serif text-lead"
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
            className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-rule px-2 py-2 sm:pl-4"
          >
            {owner ? (
              <p className="flex min-w-0 flex-1 items-center gap-2 pl-2 text-sm text-ink-soft sm:pl-0">
                <span
                  aria-hidden
                  className="size-1.5 shrink-0 rounded-full bg-revision"
                />
                <span>
                  Writing as{" "}
                  <span className="font-semibold text-ink">{site.handle}</span>{" "}
                  <span className="text-ink-faint">(published at once)</span>
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
                  className="h-11 w-full min-w-0 rounded-sm bg-transparent px-2 text-sm text-ink placeholder:text-ink-faint focus-visible:outline-offset-0 aria-invalid:text-danger sm:-ml-2"
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
                  variant="quiet"
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
                className="min-w-28 gap-1.5"
              >
                {isSending ? (
                  <>
                    <LoaderCircle aria-hidden className="animate-spin" />
                    Sending
                  </>
                ) : (
                  <>
                    {isReply ? "Reply" : "Add to notebook"}
                    <ArrowUp aria-hidden strokeWidth={1.75} />
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

        <p className="caps text-ink-faint">
          Every note is checked before it goes on the sheet.
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
            <Check
              aria-hidden
              strokeWidth={2.5}
              className="mt-0.5 size-4 shrink-0 text-wood"
            />
            {status.status === "published"
              ? "Published."
              : isReply
                ? "Reply received. It will appear for everyone once it's approved."
                : "Question received. It goes in the notebook once it's approved."}
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
        "caps tabular-nums transition-colors",
        length >= max * 0.9 ? "text-danger" : "text-ink-faint"
      )}
    >
      {length}/{max}
    </p>
  );
}

function SubmitHint() {
  const apple = useIsApple();

  return (
    <p className="hidden items-center gap-1 text-ink-faint fine:flex">
      <Kbd>{apple ? "⌘" : "Ctrl"}</Kbd>
      <Kbd>Enter</Kbd>
    </p>
  );
}
