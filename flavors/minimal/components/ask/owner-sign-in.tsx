"use client";

import * as React from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/flavors/minimal/components/ui/button";
import { CircleAlert, LoaderCircle } from "lucide-react";

import { useOwnerSignIn } from "@/components/semantic/ask/use-owner-sign-in";

/** Passphrase sign-in for owner mode, or sign-out when already signed in. */
export function OwnerSignIn() {
  const id = React.useId();
  const {
    ready,
    owner,
    busy,
    error,
    clearError,
    inputRef,
    handleSignIn,
    handleSignOut,
  } = useOwnerSignIn();

  if (ready && owner) {
    return (
      <div className="rounded-lg border border-border bg-surface/60 px-5 py-6 sm:px-6">
        <p className="flex items-center gap-2.5 meta text-foreground">
          <span aria-hidden className="size-1.5 rounded-full bg-accent" />
          Signed in
        </p>
        <p className="mt-3 max-w-[48ch] text-muted">
          Your messages on{" "}
          <Link href="/ask" className="link text-foreground">
            Ask
          </Link>{" "}
          publish immediately, and the moderation queue sits above the feed.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link href="/ask" className={buttonVariants({ variant: "accent" })}>
            Go to Ask
          </Link>
          <Button onClick={() => void handleSignOut()} disabled={busy}>
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
        <label htmlFor={`${id}-passphrase`} className="text-sm font-medium">
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
          onChange={clearError}
          className="block h-10 w-full rounded-md border border-border bg-background px-3 font-mono text-sm text-foreground transition-colors hover:border-foreground/25 focus-visible:border-accent focus-visible:outline-offset-1 aria-invalid:border-danger aria-invalid:focus-visible:border-danger"
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
          variant="accent"
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
