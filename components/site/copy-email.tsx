"use client";

import * as React from "react";

/** Copies the email; the address itself is the title, so it stays discoverable without a click. */
export function CopyEmail({
  email,
  className,
}: {
  email: string;
  className?: string;
}) {
  const [copied, setCopied] = React.useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      title={email}
      data-cursor="Copy"
      className={className}
    >
      Copy email
      <span
        aria-live="polite"
        className="ml-2 font-mono text-mono-xs tracking-[0.08em] text-accent"
      >
        {copied ? "Copied" : ""}
      </span>
    </button>
  );
}
