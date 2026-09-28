import { cn } from "@/flavors/drawing-set/lib/utils";

import { SiteIdentityText } from "@/components/semantic/identity/site-identity";

/** The plain wordmark: shown while the scene loads, without WebGL, and when motion is paused. */
export function SignatureFieldFallback({
  className,
}: {
  className?: string | undefined;
}) {
  return (
    <div
      className={cn(
        "@container flex size-full items-center justify-center bg-sheet-deep",
        className
      )}
    >
      <span className="font-display text-[24cqw] leading-none tracking-[-0.02em] text-ink select-none">
        <SiteIdentityText field="shortName" />
      </span>
    </div>
  );
}
