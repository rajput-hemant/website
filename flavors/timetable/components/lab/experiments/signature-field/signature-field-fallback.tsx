import { cn } from "@/flavors/timetable/lib/utils";

import { WORD } from "@/lib/lab/signature-field/word";

/** The word in heavy signage type: shown while the scene loads, without WebGL, and with motion paused. */
export function SignatureFieldFallback({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "@container grid size-full place-items-center bg-board",
        className
      )}
    >
      <span className="text-[22cqw] leading-none font-extrabold tracking-[-0.04em] text-flap select-none">
        {WORD}
      </span>
    </div>
  );
}
