"use client";

import { pressVoices } from "@/flavors/press/lib/sound/voices";

import { isSoundOn, playVoice } from "@/lib/sound";
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
      onClick={() =>
        void copy().then((ok) => {
          // Stamped when the copy lands, on touch too: a rare confirmation.
          if (ok && isSoundOn()) playVoice(pressVoices.stamp);
        })
      }
      title={email}
      data-cursor="Copy"
      data-voice="none"
      className={className}
    >
      <span className="relative">
        Copy email
        {/* Shown beside the label, so confirming never moves the page. */}
        <span
          aria-hidden
          data-shown={copied ? "" : undefined}
          className="copied pointer-events-none absolute top-1/2 left-full ml-2 -translate-y-1/2 slug whitespace-nowrap"
        >
          Copied
        </span>
      </span>
      <span aria-live="polite" className="sr-only">
        {copied ? "Copied" : ""}
      </span>
    </button>
  );
}
