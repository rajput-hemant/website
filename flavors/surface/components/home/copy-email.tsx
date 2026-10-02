"use client";

import { JewelLamp } from "@/flavors/surface/components/instruments/lamp";
import { playConfirm } from "@/flavors/surface/lib/sound/voices";
import { cn } from "@/flavors/surface/lib/utils";

import { useCopyEmail } from "@/components/semantic/copy-email/use-copy-email";

type Clipboard = ReturnType<typeof useCopyEmail>;

/**
 * The address as a real mailto link, plus a small key that copies it. The
 * key's legend confirms for two seconds, and a live region says so. Pass a
 * `clipboard` to share its state with another copy control.
 */
export function CopyEmail({
  email,
  clipboard: shared,
  className,
}: {
  email: string;
  clipboard?: Clipboard;
  className?: string;
}) {
  const own = useCopyEmail(email, 2000);
  const clipboard = shared ?? own;

  return (
    <div
      className={cn("flex flex-wrap items-center gap-x-3 gap-y-2", className)}
    >
      <a
        href={`mailto:${email}`}
        className="border-b border-seam pb-px font-medium transition-[border-color] duration-150 fine:hover:border-ink"
      >
        {email}
      </a>
      <button
        type="button"
        onClick={() => void clipboard.copy().then((ok) => ok && playConfirm())}
        className="key key-sm min-w-[4.5rem]"
      >
        {clipboard.copied ? "Copied" : "Copy"}
      </button>
      <span role="status" className="sr-only">
        {clipboard.copied ? "Email address copied" : ""}
      </span>
    </div>
  );
}

/**
 * The home Status module's lamp line and email. The lamp is the jewel pilot
 * lamp, lit because I'm available; clicking it copies the address, the same
 * as the Copy key (which stays the accessible way).
 */
export function StatusLine({
  availability,
  email,
}: {
  availability: string;
  email: string;
}) {
  const clipboard = useCopyEmail(email, 2000);
  return (
    <>
      <p className="flex items-center gap-2.5 font-display text-xl leading-none">
        <JewelLamp
          name="status"
          tone="signal"
          onClick={() =>
            void clipboard.copy().then((ok) => ok && playConfirm())
          }
          className="size-4"
        />
        {availability}
      </p>
      <CopyEmail email={email} clipboard={clipboard} />
    </>
  );
}
