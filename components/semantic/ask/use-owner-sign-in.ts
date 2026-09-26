"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { signIn, signOut } from "@/lib/ask/client";
import { askMessages } from "@/lib/ask/response";

import { useOwner } from "./owner-provider";

/**
 * Owner sign-in and sign-out: the passphrase check, busy and error state, and
 * focus back on the field after an error. A successful sign-in goes to Ask.
 */
export function useOwnerSignIn() {
  const { ready, owner, setOwner } = useOwner();
  const router = useRouter();
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

  return {
    ready,
    owner,
    busy,
    error,
    clearError: () => setError(null),
    inputRef,
    handleSignIn,
    handleSignOut,
  };
}
