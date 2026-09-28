"use client";

import { useCopyEmail } from "@/components/semantic/copy-email/use-copy-email";

/** Copies the email; the address is the title, so it stays discoverable without a click. */
export function CopyEmail({
  email,
  className,
}: {
  email: string;
  className?: string;
}) {
  const clipboard = useCopyEmail(email, 1600);
  return (
    <button
      type="button"
      onClick={() => void clipboard.copy()}
      title={email}
      data-cursor="Copy"
      className={className}
    >
      Copy email
      <span aria-live="polite" className="caps ml-2 text-wood">
        {clipboard.copied ? "Copied" : ""}
      </span>
    </button>
  );
}
