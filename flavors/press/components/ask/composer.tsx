"use client";

import { Button } from "@/flavors/press/components/ui/button";
import { Kbd } from "@/flavors/press/components/ui/kbd";
import { cn } from "@/flavors/press/lib/utils";
import { ArrowUp, CircleAlert, LoaderCircle } from "lucide-react";

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

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="flex items-start gap-2 text-sm text-danger">
      <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
      {message}
    </p>
  );
}

/**
 * The query slip: new questions and replies. Visitors' messages wait for
 * approval and echo for the sender; the author's publish at once.
 */
export function Composer({
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
}: {
  slug?: string;
  label: string;
  hideLabel?: boolean;
  placeholder: string;
  collapsible?: boolean;
  expandedPlaceholder?: string;
  autoFocus?: boolean;
  onSent?: (status: PostStatus) => void;
  onCancel?: () => void;
  className?: string;
}) {
  const apple = useIsApple();
  const {
    body,
    bodyError,
    clearFieldError,
    errorRef,
    expanded,
    formRef,
    handleBlur,
    handleBodyChange,
    handleKeyDown,
    handleSubmit,
    ids,
    isReply,
    isSending,
    justFiled,
    nameError,
    nameRef,
    owner,
    setExpanded,
    status,
    summary,
    textareaRef,
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
            hideLabel || collapsible ? "sr-only" : "text-h3 font-black"
          }
        >
          {label}
        </label>
        <div
          onClick={() => {
            if (!expanded) textareaRef.current?.focus();
          }}
          className={cn(
            "crop-marks bg-sheet shadow-[inset_0_0_0_1px_var(--color-rule)] transition-[shadow,translate,opacity] duration-(--duration-ui) ease-enter",
            !expanded && "cursor-text",
            "has-[textarea:focus-visible]:shadow-[inset_0_0_0_2px_var(--color-focus)] fine:hover:shadow-[inset_0_0_0_1.5px_var(--color-ink)]",
            bodyError && "shadow-[inset_0_0_0_2px_var(--color-danger)]",
            owner && "border-t-4 border-yellow",
            justFiled && "motion:translate-y-1 motion:opacity-80"
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
              "block [field-sizing:content] max-h-80 w-full resize-none bg-transparent px-4 text-ink placeholder:text-ink-soft focus-visible:outline-none",
              expanded ? "min-h-24 pt-3 pb-1 text-lead" : "min-h-12 py-3"
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
              <p className="min-w-0 flex-1 pl-2 text-sm text-ink-soft sm:pl-0">
                Replying as{" "}
                <b className="font-semibold text-ink">{site.handle}</b>,
                published at once
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
                  className="h-11 w-full min-w-0 bg-transparent px-2 text-sm text-ink placeholder:text-ink-soft focus-visible:outline-offset-0 sm:-ml-2"
                />
                <p id={ids.nameHint} className="sr-only">
                  Shown with your message. Leave it empty to stay anonymous.
                </p>
              </div>
            )}
            <div className="ml-auto flex items-center gap-3">
              {body.length > 0 ? (
                <span
                  aria-hidden
                  className={cn(
                    "slug tabular-nums",
                    body.length >= bodyMax * 0.9 && "text-danger!"
                  )}
                >
                  {body.length}/{bodyMax}
                </span>
              ) : null}
              <span className="hidden items-center gap-1 fine:flex" aria-hidden>
                <Kbd>{apple ? "⌘" : "Ctrl"}</Kbd>
                <Kbd>Enter</Kbd>
              </span>
              {onCancel ? (
                <Button variant="quiet" size="sm" onClick={onCancel}>
                  Cancel
                </Button>
              ) : null}
              <Button type="submit" size="sm" magnetic className="min-w-28">
                {isSending ? (
                  <>
                    <LoaderCircle aria-hidden className="animate-spin" />
                    Sending
                  </>
                ) : (
                  <>
                    {isReply ? "Reply" : "Send query"}
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
        <p className="slug">
          Every query is read by hand. Nothing is public until it&rsquo;s
          approved.
        </p>
      </fieldset>
      {/* Always rendered: a live region added together with its text is often not announced. */}
      <div aria-live="polite" className="text-sm">
        {summary ? (
          <p
            ref={errorRef}
            tabIndex={-1}
            className="mt-3 flex items-start gap-2 text-danger outline-none"
          >
            <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
            {summary}
          </p>
        ) : null}
        {status.kind === "sent" ? (
          <p className="mt-3 text-ink-soft">
            {status.status === "published"
              ? "Published."
              : isReply
                ? "Reply received. It will appear for everyone once it's approved."
                : "Query received. It will be posted once it's approved."}
          </p>
        ) : null}
      </div>
    </form>
  );
}
