"use client";

import * as React from "react";
import Link from "next/link";
import { Led } from "@/flavors/surface/components/ui/primitives";

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
      <div className="mod max-w-xl px-5 py-6 sm:px-6">
        <p className="legend flex items-center gap-2.5 text-ink">
          <Led on />
          Signed in
        </p>
        <p className="mt-3 max-w-[48ch] text-ink-2">
          Your messages on{" "}
          <Link href="/ask" className="text-ink underline underline-offset-2">
            Ask
          </Link>{" "}
          publish immediately, and the moderation queue sits above the feed.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-2.5">
          <Link href="/ask" className="key">
            Go to Ask
          </Link>
          <button
            type="button"
            className="key"
            onClick={() => void handleSignOut()}
            disabled={busy}
          >
            {busy ? "Signing out" : "Sign out"}
          </button>
        </div>
        <div aria-live="polite">
          {error && (
            <p className="mt-4 text-sm font-medium text-alarm">{error}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={(event) => void handleSignIn(event)}
      noValidate
      aria-busy={busy}
      className="mod grid max-w-sm gap-5 p-5"
    >
      <fieldset disabled={busy} className="grid min-w-0 gap-2">
        <label htmlFor={`${id}-passphrase`} className="legend text-ink">
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
          className="glass block h-11 w-full px-3 text-base text-lcd-ink aria-invalid:outline-2 aria-invalid:outline-alarm"
        />
        <div aria-live="polite">
          {error && (
            <p
              id={`${id}-error`}
              className="pt-1 text-sm font-medium text-alarm"
            >
              {error}
            </p>
          )}
        </div>
      </fieldset>
      <div>
        <button type="submit" className="key min-w-28" disabled={busy}>
          <Led on={busy} />
          {busy ? "Signing in" : "Sign in"}
        </button>
      </div>
    </form>
  );
}
