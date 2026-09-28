import { cn } from "@/flavors/mission/lib/utils";

import { WORD } from "@/lib/lab/signature-field/word";

/** The word on a ruled ground: shown while the scene loads, without WebGL, and with motion paused. */
export function SignatureFieldFallback({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "@container grid size-full place-items-center bg-[repeating-linear-gradient(45deg,var(--color-rule)_0_1px,transparent_1px_6px)]",
        className
      )}
    >
      <span className="font-display text-[20cqw] leading-none tracking-[-0.02em] text-ink select-none">
        {WORD}
      </span>
    </div>
  );
}
