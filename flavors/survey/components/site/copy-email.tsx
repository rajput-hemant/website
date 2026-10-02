"use client";

import { playConfirm } from "@/flavors/survey/lib/sound/voices";

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
      onClick={() => void clipboard.copy().then((ok) => ok && playConfirm())}
      title={email}
      data-cursor="Copy"
      className={className}
    >
      <span className="relative">
        Copy email
        {/* Beside the label, so confirming never moves the page. */}
        <span
          aria-hidden
          data-shown={clipboard.copied ? "" : undefined}
          className="copied caps pointer-events-none absolute top-1/2 left-full ml-2 -translate-y-1/2 whitespace-nowrap text-wood"
        >
          Copied
        </span>
      </span>
      <span aria-live="polite" className="sr-only">
        {clipboard.copied ? "Copied" : ""}
      </span>
    </button>
  );
}
