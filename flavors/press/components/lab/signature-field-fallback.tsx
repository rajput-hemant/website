import { Overprint } from "@/flavors/press/components/ui/overprint";
import { cn } from "@/flavors/press/lib/utils";

import { WORD } from "@/lib/lab/signature-field/word";

/** The word on two plates: shown while the scene loads, without WebGL, and with motion paused. */
export function SignatureFieldFallback({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "@container grid size-full place-items-center bg-sheet",
        className
      )}
    >
      <Overprint className="text-[22cqw] leading-none font-black tracking-[-0.05em] select-none">
        {WORD}
      </Overprint>
    </div>
  );
}
