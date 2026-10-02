"use client";

import { Stamp } from "@/flavors/drawing-set/components/ui";
import { playStamp } from "@/flavors/drawing-set/lib/sound/voices";

import { useCopyEmail } from "@/components/semantic/copy-email/use-copy-email";

/**
 * Copies the email; the address itself is the title, so it stays discoverable
 * without a click. A COPIED stamp presses in beside it, holds, then fades. The
 * stamp is display:none between uses, so it holds no space; with motion off it
 * only fades.
 */
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
      onClick={() => void copy().then((ok) => ok && playStamp())}
      title={email}
      data-cursor="Copy"
      className={className}
    >
      Copy email
      <span aria-live="polite" className="sr-only">
        {copied ? "Copied" : ""}
      </span>
      <span
        aria-hidden
        data-copied={copied || undefined}
        className="motion:starting:-rotate-3.5 -my-2 ml-2 hidden origin-left transition-[opacity,scale,rotate,display] transition-discrete duration-160 ease-exit not-data-copied:opacity-0 data-copied:inline-block data-copied:duration-180 data-copied:ease-flick starting:opacity-0 motion:starting:scale-[1.12]"
      >
        <Stamp tone="accent" meaning="Email copied">
          Copied
        </Stamp>
      </span>
    </button>
  );
}
