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
      Copy email
      <span aria-live="polite" className="ml-2 slug">
        {copied ? "Copied" : ""}
      </span>
    </button>
  );
}
