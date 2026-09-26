import { cn } from "@/flavors/drawing-set/lib/utils";

import { WORD } from "./word";

/** The plain wordmark: shown while the scene loads, without WebGL, and when motion is paused. */
export function SignatureFieldFallback({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "@container flex size-full items-center justify-center bg-sheet-deep",
        className
      )}
    >
      <span className="font-display text-[24cqw] leading-none tracking-[-0.02em] text-ink select-none">
        {WORD}
      </span>
    </div>
  );
}
