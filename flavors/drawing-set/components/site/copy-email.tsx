"use client";

import { useCopyEmail } from "@/components/semantic/copy-email/use-copy-email";

/** Copies the email; the address itself is the title, so it stays discoverable without a click. */
export function CopyEmail({
  email,
  className,
}: {
  email: string;
  className?: string;
}) {
  const { copied, copy } = useCopyEmail(email, 1600);

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
