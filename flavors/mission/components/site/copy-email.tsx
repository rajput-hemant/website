"use client";

import { useCopyEmail } from "@/components/semantic/copy-email/use-copy-email";

/** Copies the address; the address is the title, so it stays discoverable without a click. */
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
      onClick={() => void copy()}
      title={email}
      data-voice="quindar"
      className={className}
    >
      Copy email
      <span aria-live="polite" className="ml-2 label">
        {copied ? "Copied" : ""}
      </span>
    </button>
  );
}
