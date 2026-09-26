"use client";

import * as React from "react";
import Link from "next/link";
import { Button, buttonClass } from "@/flavors/press/components/ui/button";
import { CircleAlert, LoaderCircle } from "lucide-react";

import { useOwnerSignIn } from "@/components/semantic/ask/use-owner-sign-in";

/** The author's sign-in for the corrections sheet, or sign-out when already signed in. */
export function OwnerSignIn() {
  const id = React.useId();
  const {
    busy,
    clearError,
    error,
    handleSignIn,
    handleSignOut,
    inputRef,
    owner,
    ready,
  } = useOwnerSignIn();

  if (ready && owner) {
    return (
      <div className="crop-marks max-w-xl bg-sheet p-6 shadow-sheet">
        <p className="flex items-center gap-2.5 text-lead font-extrabold">
          <i aria-hidden className="size-3 bg-yellow" />
          Signed in as the author
        </p>
        <p className="mt-3 text-ink-soft">
          Your replies on the{" "}
          <Link href="/ask" className="font-bold text-ink underline">
            corrections sheet
          </Link>{" "}
          publish at once, and the moderation queue sits above the queries.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link href="/ask" className={buttonClass()}>
            Go to the sheet
          </Link>
          <Button
            variant="outline"
            onClick={() => void handleSignOut()}
            disabled={busy}
          >
            {busy ? (
              <LoaderCircle aria-hidden className="animate-spin" />
            ) : null}
            Sign out
          </Button>
        </div>
        <div aria-live="polite">
          {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
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
        <label htmlFor={`${id}-passphrase`} className="font-bold">
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
          className="block h-12 w-full bg-sheet px-3 font-mono text-base shadow-[inset_0_0_0_1.5px_var(--color-ink)] focus-visible:outline-offset-1 aria-invalid:shadow-[inset_0_0_0_2px_var(--color-danger)]"
        />
        <div aria-live="polite">
          {error ? (
            <p
              id={`${id}-error`}
              className="flex items-start gap-2 pt-1 text-sm text-danger"
            >
              <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
              {error}
            </p>
          ) : null}
        </div>
      </fieldset>
      <div>
        <Button type="submit" className="min-w-32" disabled={busy}>
          {busy ? <LoaderCircle aria-hidden className="animate-spin" /> : null}
          Sign in
        </Button>
      </div>
    </form>
  );
}
