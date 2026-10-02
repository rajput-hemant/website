"use client";

import * as React from "react";
import Link from "next/link";
import { KeySwitch } from "@/flavors/surface/components/instruments/key-switch";
import { JewelLamp } from "@/flavors/surface/components/instruments/lamp";
import { Led } from "@/flavors/surface/components/ui/primitives";
import { playAlarm, playConfirm } from "@/flavors/surface/lib/sound/voices";

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

  // Beep when this visit signs in, not when it loads already signed in.
  const wasOwner = React.useRef<boolean | null>(null);
  React.useEffect(() => {
    if (!ready) return;
    if (wasOwner.current === false && owner) playConfirm();
    wasOwner.current = owner;
  }, [ready, owner]);
  React.useEffect(() => {
    if (error) playAlarm();
  }, [error]);
  // Each new error rattles the key once.
  const [seen, setSeen] = React.useState(error);
  const [shake, setShake] = React.useState(0);
  if (error !== seen) {
    setSeen(error);
    if (error) setShake(shake + 1);
  }
  const signedIn = ready && owner;

  const panel = signedIn ? (
    <div className="mod max-w-xl px-5 py-6 sm:px-6">
      <p className="legend flex items-center gap-2.5 text-ink">
        <JewelLamp name="owner" tone="signal" className="size-4" />
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
  ) : (
    <form
      onSubmit={(event) => void handleSignIn(event)}
      noValidate
      aria-busy={busy}
      className="mod grid max-w-sm gap-5 p-5"
    >
      <p className="legend flex items-center gap-2.5 text-ink">
        <JewelLamp
          name="owner"
          tone={error ? "alarm" : busy ? "signal" : "off"}
          pulse={busy}
          className="size-4"
        />
        {busy ? "Checking" : error ? "Locked, try again" : "Locked"}
      </p>
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

  return (
    <div className="flex flex-wrap items-start gap-x-8 gap-y-5">
      <KeySwitch open={signedIn} shake={shake} />
      {panel}
    </div>
  );
}
