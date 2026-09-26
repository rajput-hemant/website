"use client";

import * as React from "react";
import { announceCopied } from "@/flavors/minimal/components/interaction/cursor-events";
import { cn } from "@/flavors/minimal/lib/utils";
import { Check, Copy } from "lucide-react";

const RESET_AFTER_MS = 1800;

export type CopyEmailProps = {
  email: string;
  className?: string;
};

/**
 * The address as a `mailto:` link (works without JavaScript) followed by a
 * copy button. The button's label swaps to "Copied" in a fixed-width cell so
 * nothing after it moves, and a live region announces the copy.
 */
export function CopyEmail({ email, className }: CopyEmailProps) {
  const [copied, setCopied] = React.useState(false);
  const resetTimer = React.useRef<ReturnType<typeof setTimeout>>(undefined);

  React.useEffect(() => () => clearTimeout(resetTimer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      window.location.href = `mailto:${email}`;
      return;
    }
    setCopied(true);
    announceCopied();
    clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setCopied(false), RESET_AFTER_MS);
  }

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <a href={`mailto:${email}`} className="hit-area link">
        {email}
      </a>
      <button
        type="button"
        onClick={copy}
        data-cursor="copy"
        aria-label={`Copy ${email} to the clipboard`}
        className="group/copy hit-area -my-1 inline-flex items-center gap-1.5 rounded-sm px-1.5 py-1 meta text-subtle transition-colors duration-(--duration-exit) hover:bg-surface-2 hover:text-foreground"
      >
        <span className="relative size-3">
          <Copy
            aria-hidden
            strokeWidth={1.75}
            className={cn(
              "absolute inset-0 size-3 transition-[opacity,scale] duration-(--duration-enter) ease-enter",
              copied && "scale-50 opacity-0"
            )}
          />
          <Check
            aria-hidden
            strokeWidth={2}
            className={cn(
              "absolute inset-0 size-3 text-accent transition-[opacity,scale] duration-(--duration-enter) ease-enter",
              !copied && "scale-50 opacity-0"
            )}
          />
        </span>
        <span aria-hidden className="grid">
          <span
            className={cn(
              "col-start-1 row-start-1 transition-opacity duration-(--duration-exit)",
              copied && "opacity-0"
            )}
          >
            Copy
          </span>
          <span
            className={cn(
              "col-start-1 row-start-1 text-foreground transition-opacity duration-(--duration-exit)",
              !copied && "opacity-0"
            )}
          >
            Copied
          </span>
        </span>
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? "Email address copied" : ""}
      </span>
    </span>
  );
}
