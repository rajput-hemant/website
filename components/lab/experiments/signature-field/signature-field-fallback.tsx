import { cn } from "@/lib/utils";

import { WORD } from "./word";

/** The plain wordmark: shown while the scene loads, without WebGL, and when motion is paused. */
export function SignatureFieldFallback({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "@container flex size-full items-center justify-center",
        className
      )}
    >
      <span className="wordmark text-[24cqw] leading-none text-foreground select-none">
        {WORD}
      </span>
    </div>
  );
}
