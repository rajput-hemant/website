"use client";

import { Led } from "@/flavors/surface/components/ui/primitives";
import { Seg } from "@/flavors/surface/components/ui/seg";
import { cn } from "@/flavors/surface/lib/utils";

import { site } from "@/content/site";
import type { PostStatus } from "@/lib/ask/client";
import { askFieldLimits } from "@/lib/ask/fields";
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
 * The input module: new threads and replies. Visitors' messages wait for
 * moderation and echo in place for the sender; the owner's publish at once.
 * The Send key's lamp lights while sending and briefly once it's through.
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
  } = useAskComposer({ slug, collapsible, autoFocus, onSent, onCancel });

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
          className={hideLabel || collapsible ? "sr-only" : "legend text-ink"}
        >
          {label}
        </label>

        <div
          data-expanded={expanded || undefined}
          onClick={() => {
            if (!expanded) textareaRef.current?.focus();
          }}
          className={cn(
            "mod p-2.5",
            !expanded && "cursor-text",
            bodyError &&
              "shadow-[inset_0_1px_0_var(--color-hi),0_0_0_1.5px_var(--color-alarm)]"
          )}
        >
          <div className="glass has-[textarea:focus-visible]:outline-2 has-[textarea:focus-visible]:outline-offset-2 has-[textarea:focus-visible]:outline-ink">
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
                "block [field-sizing:content] max-h-80 w-full resize-none bg-transparent px-4 text-base leading-relaxed text-lcd-ink placeholder:text-lcd-ink-2 focus-visible:outline-none",
                !expanded
                  ? "min-h-12 py-3 leading-6"
                  : isReply
                    ? "min-h-18 pt-3 pb-3"
                    : "min-h-28 pt-3.5 pb-3 sm:text-lg"
              )}
            />
          </div>
          <p id={ids.bodyHint} className="sr-only">
            Between {bodyMin} and {bodyMax} characters. Press Control or Command
            with Enter to send.{" "}
            {owner
              ? "Your message is published immediately."
              : "Messages appear after they are approved."}
          </p>

          <div
            hidden={!expanded}
            className="flex flex-wrap items-center gap-x-3 gap-y-2.5 px-0.5 pt-2.5"
          >
            {owner ? (
              <p className="legend flex min-w-0 flex-1 items-center gap-2">
                <Led on />
                <span>
                  Posting as{" "}
                  <span className="text-ink normal-case">{site.handle}</span>,
                  published immediately
                </span>
              </p>
            ) : (
              <div className="min-w-0 flex-1 basis-44">
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
                  className="h-9 w-full min-w-0 rounded-[5px] bg-plate-lo/60 px-3 text-sm text-ink shadow-[inset_0_1px_2px_rgb(0_0_0/0.25)] placeholder:text-ink-2 aria-invalid:text-alarm"
                />
                <p id={ids.nameHint} className="sr-only">
                  Shown with your message. Leave it empty to stay anonymous.
                </p>
              </div>
            )}

            <div className="ml-auto flex items-center gap-2.5">
              <BodyCounter length={body.length} max={bodyMax} />
              <SubmitHint />
              {onCancel && (
                <button type="button" onClick={onCancel} className="key key-sm">
                  Cancel
                </button>
              )}
              <button type="submit" className="key min-w-32">
                <Led on={isSending || justFiled} />
                {isSending
                  ? "Sending"
                  : isReply
                    ? "Send reply"
                    : "Send question"}
              </button>
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

        <p className="legend tracking-[0.04em] normal-case">
          Messages are read before they appear. Nothing is public until
          it&rsquo;s approved.
        </p>
      </fieldset>

      {/* Always rendered: a live region added together with its text is often not announced. */}
      <div aria-live="polite" className="text-sm">
        {summary && (
          <p
            ref={errorRef}
            tabIndex={-1}
            className="mt-3 flex items-start gap-2 font-medium text-alarm outline-none"
          >
            {summary}
          </p>
        )}
        {status.kind === "sent" && (
          <p className="mt-3 flex items-center gap-2 text-ink-2">
            <Led on />
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
    <p id={id} className="text-sm font-medium text-alarm">
      {message}
    </p>
  );
}

function BodyCounter({ length, max }: { length: number; max: number }) {
  if (length === 0) return null;
  return (
    <p aria-hidden className="glass flex h-8 items-center px-2">
      <Seg value={String(max - length).padStart(4, " ")} className="h-4" />
    </p>
  );
}

function SubmitHint() {
  const apple = useIsApple();

  return (
    <p aria-hidden className="legend hidden fine:block">
      {apple ? "⌘" : "Ctrl"} Enter
    </p>
  );
}
