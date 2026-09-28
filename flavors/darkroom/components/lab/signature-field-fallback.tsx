import { cn } from "@/flavors/darkroom/lib/utils";

import { WORD } from "@/lib/lab/signature-field/word";

/**
 * The word as a print on the easel, stepped through six exposures like a
 * test strip: shown while the scene loads, without WebGL, and with motion
 * paused.
 */
export function SignatureFieldFallback({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "@container relative grid size-full place-items-center overflow-hidden bg-img-lo",
        className
      )}
    >
      <span className="text-[22cqw] leading-none font-bold tracking-[-0.05em] text-img-hi select-none">
        {WORD}
      </span>
      <span
        aria-hidden
        className="absolute inset-0 grid grid-cols-6 [&>i]:bg-strip"
      >
        {[0, 0.12, 0.24, 0.36, 0.48, 0.6].map((alpha) => (
          <i key={alpha} style={{ opacity: alpha }} />
        ))}
      </span>
    </div>
  );
}
