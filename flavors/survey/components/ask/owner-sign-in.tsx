"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/flavors/survey/components/ui/button";
import { CircleAlert, LoaderCircle } from "lucide-react";

import { useOwnerSignIn } from "@/components/semantic/ask/use-owner-sign-in";

/** The surveyor's sign-in for the field notebook, or sign-out when already signed in. */
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
      <div className="max-w-xl border border-l-2 border-rule border-l-revision bg-sheet p-6">
        <p className="caps flex items-center gap-2.5 text-revision">
          <span aria-hidden className="size-2 rounded-full bg-revision" />
          Signed in as surveyor
        </p>
        <p className="mt-3 text-ink-soft">
          Your answers in the{" "}
          <Link
            href="/ask"
            className="text-ink underline decoration-contour underline-offset-[0.3em] fine:hover:text-water"
          >
            field notebook
          </Link>{" "}
          publish at once, and the revision queue sits above the entries.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button asChild>
            <Link href="/ask">Open the notebook</Link>
          </Button>
          <Button
            variant="ghost"
            onClick={() => void handleSignOut()}
            disabled={busy}
          >
            {busy && (
              <LoaderCircle aria-hidden className="size-4 animate-spin" />
            )}
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
        <label htmlFor={`${id}-passphrase`} className="caps text-ink-soft">
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
          className="block h-12 w-full rounded-sm border border-rule-strong bg-sheet px-3 text-base text-ink focus-visible:outline-offset-1 aria-invalid:border-danger"
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
        <Button type="submit" className="min-w-32" disabled={busy}>
          {busy && <LoaderCircle aria-hidden className="size-4 animate-spin" />}
          Sign in
        </Button>
      </div>
    </form>
  );
}
