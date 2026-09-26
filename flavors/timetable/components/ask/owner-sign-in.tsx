"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/flavors/timetable/components/ui";
import { CircleAlert, LoaderCircle } from "lucide-react";

import { useOwnerSignIn } from "@/components/semantic/ask/use-owner-sign-in";

/** Staff sign-in for the information desk, or sign-out when already on duty. */
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
      <div className="max-w-xl rounded-lg bg-surface p-6 shadow-[inset_0_0_0_1.5px_var(--color-rule)]">
        <p className="flex items-center gap-2.5 text-lead font-extrabold">
          <span
            aria-hidden
            className="size-3 rounded-full bg-signal shadow-[0_0_0_1.5px_var(--color-ink)]"
          />
          On duty
        </p>
        <p className="mt-3 text-ink-soft">
          Your replies at the{" "}
          <Link
            href="/ask"
            className="font-bold text-ink underline decoration-2 underline-offset-[0.2em]"
          >
            information desk
          </Link>{" "}
          post at once, and the moderation queue sits above the notices.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button asChild>
            <Link href="/ask">Go to the desk</Link>
          </Button>
          <Button
            variant="ghost"
            arrow={false}
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
          className="block h-12 w-full rounded-md bg-surface px-3 font-mono text-base text-ink shadow-[inset_0_0_0_1.5px_var(--color-rule-strong)] focus-visible:outline-offset-1 aria-invalid:shadow-[inset_0_0_0_2px_var(--color-danger)]"
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
