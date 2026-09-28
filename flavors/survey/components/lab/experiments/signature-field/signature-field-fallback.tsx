import { cn } from "@/flavors/survey/lib/utils";

import { WORD } from "@/lib/lab/signature-field/word";

/** The word in spaced region lettering: shown while the scene loads, without WebGL, and with motion paused. */
export function SignatureFieldFallback({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "@container grid size-full place-items-center bg-sheet",
        className
      )}
    >
      <span className="mr-[-0.2em] font-display text-[14cqw] leading-none tracking-[0.2em] text-ink uppercase select-none">
        {WORD}
      </span>
    </div>
  );
}
