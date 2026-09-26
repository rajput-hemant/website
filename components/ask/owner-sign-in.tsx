"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CircleAlert, LoaderCircle } from "lucide-react";

import { askMessages } from "@/lib/ask/response";
import { Button } from "@/components/ui";

import { signIn, signOut } from "./api";
import { useOwner } from "./owner-provider";

/** Passphrase sign-in for owner mode, or sign-out when already signed in. */
export function OwnerSignIn() {
  const { ready, owner, setOwner } = useOwner();
  const router = useRouter();
  const id = React.useId();
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (error) inputRef.current?.focus();
  }, [error]);

  async function handleSignIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const passphrase = inputRef.current?.value ?? "";
    if (!passphrase) {
      setError("Enter the passphrase.");
      return;
    }
    setBusy(true);
    setError(null);
    const result = await signIn(passphrase);
    setBusy(false);
    if (!result.ok || !result.owner) {
      setError(result.ok ? askMessages.ownerWrong : result.message);
      return;
    }
    setOwner(true);
    router.push("/ask");
  }

  async function handleSignOut() {
    setBusy(true);
    const result = await signOut();
    setBusy(false);
    if (result.ok) setOwner(false);
    else setError(result.message);
  }

  if (ready && owner) {
    return (
      <div className="rounded-md border border-rule bg-ink-raised/60 px-5 py-6 sm:px-6">
        <p className="flex items-center gap-2.5 font-mono text-mono-xs tracking-[0.1em] text-paper uppercase">
          <span aria-hidden className="size-1.5 rounded-full bg-accent" />
          Signed in
        </p>
        <p className="mt-3 max-w-[48ch] text-graphite">
          Your messages on{" "}
          <Link href="/ask" className="text-paper underline underline-offset-2">
            Ask
          </Link>{" "}
          publish immediately, and the moderation queue sits above the tray.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button asChild variant="primary">
            <Link href="/ask">Go to Ask</Link>
          </Button>
          <Button
            variant="quiet"
            onClick={() => void handleSignOut()}
            disabled={busy}
          >
            {busy && <LoaderCircle aria-hidden className="animate-spin" />}
            Sign out
          </Button>
        </div>
        <div aria-live="polite">
          {error && <p className="mt-4 text-sm text-danger">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={(event) => void handleSignIn(event)}
      noValidate
      aria-busy={busy}
      className="grid max-w-sm gap-5"
    >
      <fieldset disabled={busy} className="grid min-w-0 gap-2">
        <label
          htmlFor={`${id}-passphrase`}
          className="text-sm font-medium text-paper"
        >
          Passphrase
        </label>
        <input
          ref={inputRef}
          id={`${id}-passphrase`}
          name="passphrase"
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={() => setError(null)}
          className="block h-11 w-full rounded-sm border border-rule bg-ink-sunken px-3 font-mono text-sm text-paper transition-colors hover:border-graphite/60 focus-visible:border-accent focus-visible:outline-offset-1 aria-invalid:border-danger"
        />
        <div aria-live="polite">
          {error && (
            <p
              id={`${id}-error`}
              className="flex items-start gap-2 pt-1 text-sm text-danger"
            >
              <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
              {error}
            </p>
          )}
        </div>
      </fieldset>
      <div>
        <Button
          type="submit"
          variant="primary"
          className="min-w-28"
          disabled={busy}
        >
          {busy && <LoaderCircle aria-hidden className="animate-spin" />}
          Sign in
        </Button>
      </div>
    </form>
  );
}
