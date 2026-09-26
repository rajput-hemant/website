"use client";

import * as React from "react";

/** Click to copy the email to the clipboard; falls back silently where the clipboard API is unavailable. */
export function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = React.useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard permission denied or unavailable; nothing to fall back to here.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      data-cursor="Copy"
      className="press inline-flex min-h-11 items-center gap-2 text-sm text-graphite transition-colors duration-(--duration-ui) fine:hover:text-paper"
    >
      {email}
      <span aria-live="polite" className="font-mono text-mono-xs text-lamp">
        {copied ? "Copied" : ""}
      </span>
    </button>
  );
}
