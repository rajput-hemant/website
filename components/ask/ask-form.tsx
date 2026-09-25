"use client";

import {
  startTransition,
  useActionState,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type ComponentProps,
  type FormEvent,
  type KeyboardEvent,
  type Ref,
} from "react";
import { CircleAlert, LoaderCircle } from "lucide-react";

import { askFieldLimits, type AskField } from "@/lib/ask/schema";
import { useFinePointer } from "@/lib/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";

import { sendMessage, type AskFormState } from "./send-message";

const idle: AskFormState = { status: "idle" };

const fieldClass =
  "block w-full rounded-md border border-border bg-background px-3 text-base text-foreground transition-colors placeholder:text-subtle hover:border-foreground/25 focus-visible:border-accent focus-visible:outline-offset-1 aria-invalid:border-danger disabled:opacity-60";

const noopSubscribe = () => () => {};

const isAskField = (name: string): name is AskField =>
  name === "body" || name === "name" || name === "email";

function useIsApple() {
  return useSyncExternalStore(
    noopSubscribe,
    () => /Mac|iPhone|iPad/.test(navigator.userAgent),
    () => false
  );
}

/** The /ask form. Posts JSON to `/api/ask`; every message waits for moderation. */
export function AskForm() {
  const [state, dispatch, isPending] = useActionState(sendMessage, idle);
  const [body, setBody] = useState("");
  const mountedAt = useRef(0);
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const id = useId();
  const [edited, setEdited] = useState<{
    state: AskFormState;
    fields: AskField[];
  }>({ state, fields: [] });

  useEffect(() => {
    mountedAt.current = performance.now();
  }, []);

  useEffect(() => {
    if (state.status === "success") successRef.current?.focus();
    if (state.status !== "error") return;
    // The disabled fieldset dropped focus while sending; put it back somewhere useful.
    const firstInvalid = formRef.current?.querySelector<HTMLElement>(
      "[aria-invalid='true']"
    );
    (firstInvalid ?? errorRef.current)?.focus();
  }, [state]);

  if (state.status === "success") {
    return <AskSuccess ref={successRef} />;
  }

  const showError = state.status === "error" && !isPending;
  const fieldErrors = showError ? state.fieldErrors : {};
  // A field's error stays until that field is edited or the form is sent again.
  const editedFields = edited.state === state ? edited.fields : [];
  const errorFor = (field: AskField) =>
    editedFields.includes(field) ? undefined : fieldErrors[field]?.[0];

  function handleChange(event: FormEvent<HTMLFormElement>) {
    const { target } = event;
    if (!(
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement
    ))
      return;
    const { name } = target;
    if (isAskField(name) && fieldErrors[name]) {
      setEdited({ state, fields: [...editedFields, name] });
    }
  }
  const ids = {
    body: `${id}-body`,
    name: `${id}-name`,
    email: `${id}-email`,
    website: `${id}-website`,
  };
  const describedBy = (field: AskField, hint?: string) =>
    [hint, errorFor(field) && `${ids[field]}-error`]
      .filter(Boolean)
      .join(" ") || undefined;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending) return;
    const data = new FormData(event.currentTarget);
    const text = (key: string) => {
      const value = data.get(key);
      return typeof value === "string" ? value : "";
    };
    startTransition(() =>
      dispatch({
        body: text("body"),
        name: text("name"),
        email: text("email"),
        website: text("website"),
        mountedAt: mountedAt.current,
      })
    );
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      formRef.current?.requestSubmit();
    }
  }

  const { min, max } = askFieldLimits.body;

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      onChange={handleChange}
      noValidate
      aria-busy={isPending}
      aria-label="Send a message"
      className="relative"
    >
      <fieldset disabled={isPending} className="grid min-w-0 gap-6">
        <div className="grid gap-2">
          <label htmlFor={ids.body} className="text-sm font-medium">
            Your message
          </label>
          <textarea
            id={ids.body}
            name="body"
            rows={5}
            required
            maxLength={max}
            value={body}
            onChange={(event) => setBody(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="A question, a thought, or just hello."
            aria-invalid={errorFor("body") ? true : undefined}
            aria-describedby={describedBy("body", `${ids.body}-hint`)}
            className={cn(
              fieldClass,
              "min-h-36 resize-y py-2.5 leading-relaxed"
            )}
          />
          <div className="flex items-start gap-4">
            <FieldError id={`${ids.body}-error`} message={errorFor("body")} />
            <p id={`${ids.body}-hint`} className="sr-only">
              Between {min} and {max} characters.
            </p>
            <BodyCounter length={body.length} max={max} />
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <TextField
            id={ids.name}
            name="name"
            label="Name"
            hint="Shown with your message. Leave it empty to stay anonymous."
            autoComplete="name"
            maxLength={askFieldLimits.name.max}
            error={errorFor("name")}
            describedBy={describedBy("name", `${ids.name}-hint`)}
          />
          <TextField
            id={ids.email}
            name="email"
            type="email"
            inputMode="email"
            label="Email"
            hint="Only to notify you, never shown."
            autoComplete="email"
            maxLength={askFieldLimits.email.max}
            error={errorFor("email")}
            describedBy={describedBy("email", `${ids.email}-hint`)}
          />
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

        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <Button type="submit" variant="accent" className="min-w-36">
            {isPending ? (
              <>
                <LoaderCircle aria-hidden className="animate-spin" />
                Sending…
              </>
            ) : (
              "Send message"
            )}
          </Button>
          <SubmitHint />
        </div>
      </fieldset>

      {/* Always rendered: a live region added together with its text is often not announced. */}
      <div aria-live="polite">
        {showError && (
          <p
            ref={errorRef}
            tabIndex={-1}
            className="mt-5 flex items-start gap-2 text-sm text-danger"
          >
            <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}

function TextField({
  id,
  label,
  hint,
  error,
  describedBy,
  ...props
}: {
  id: string;
  label: string;
  hint: string;
  error: string | undefined;
  describedBy: string | undefined;
} & Omit<ComponentProps<"input">, "id" | "aria-describedby">) {
  return (
    <div className="grid content-start gap-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label} <span className="font-normal text-subtle">(optional)</span>
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(fieldClass, "h-10")}
        {...props}
      />
      <p id={`${id}-hint`} className="text-xs text-subtle">
        {hint}
      </p>
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="text-sm text-danger">
      {message}
    </p>
  );
}

function BodyCounter({ length, max }: { length: number; max: number }) {
  return (
    <p
      aria-hidden
      className={cn(
        "ml-auto shrink-0 meta tabular-nums transition-colors",
        length >= max * 0.9 ? "text-accent" : "text-subtle"
      )}
    >
      {length} / {max}
    </p>
  );
}

function SubmitHint() {
  const finePointer = useFinePointer();
  const apple = useIsApple();
  if (!finePointer) return null;

  return (
    <p className="flex items-center gap-1.5 text-xs text-subtle">
      <Kbd>{apple ? "⌘" : "Ctrl"}</Kbd>
      <Kbd>Enter</Kbd>
      <span>to send</span>
    </p>
  );
}

function AskSuccess({ ref }: { ref: Ref<HTMLDivElement> }) {
  return (
    <div
      ref={ref}
      tabIndex={-1}
      role="status"
      className="rounded-lg border border-border bg-surface px-6 py-8 outline-none sm:px-8"
    >
      <p className="meta text-accent">Received</p>
      <p className="mt-3 display text-3xl text-foreground">
        Thank you, it&rsquo;s in my inbox.
      </p>
      <p className="mt-4 max-w-[52ch] text-muted">
        I read every message myself. Once I&rsquo;ve replied, yours will appear
        on this page, and if you left an email I&rsquo;ll let you know.
      </p>
    </div>
  );
}
