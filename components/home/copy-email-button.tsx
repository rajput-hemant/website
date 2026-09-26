"use client";

import * as React from "react";

import { Button } from "@/components/ui";

const COPIED_TIMEOUT = 2000;

/** Copies the owner's email on click and announces it in a live region. */
export function CopyEmailButton({ email }: { email: string }) {
  const [copied, setCopied] = React.useState(false);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopied(false), COPIED_TIMEOUT);
    } catch {
      // Clipboard access can be denied or unavailable; the email is still
      // visible on the button for the visitor to select and copy by hand.
    }
  }

  React.useEffect(() => () => clearTimeout(timeoutRef.current), []);

  return (
    <span className="inline-flex items-center gap-2">
      <Button type="button" variant="ghost" size="sm" onClick={handleCopy}>
        {email}
      </Button>
      <span aria-live="polite" className="font-mono text-mono-xs text-accent">
        {copied ? "Copied" : ""}
      </span>
    </span>
  );
}
