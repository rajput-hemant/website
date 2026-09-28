"use client";

import { FlapText } from "@/flavors/timetable/components/ui/flap-text";
import { playChime } from "@/flavors/timetable/lib/sound/voices";

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
      onClick={() => void copy().then((ok) => ok && playChime())}
      title={email}
      data-cursor="Copy"
      className={className}
    >
      Copy email
      {/* "Copied" lands on the flaps in under 300ms; the chime says the rest. */}
      <span aria-live="polite" className="ml-2 inline-flex">
        {copied ? <FlapText text="Copied" size="sm" riffle={3} /> : null}
      </span>
    </button>
  );
}
