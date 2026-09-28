import { cn } from "@/flavors/calibre/lib/utils";

import { SiteIdentityText } from "@/components/semantic/identity/site-identity";

/**
 * The word on the bench, stepped through six densities like a rate
 * chart: shown while the scene loads, without WebGL, and with motion
 * paused.
 */
export function SignatureFieldFallback({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "@container relative grid size-full place-items-center overflow-hidden bg-well",
        className
      )}
    >
      <span className="text-[22cqw] leading-none font-medium tracking-[-0.05em] text-plate select-none">
        <SiteIdentityText field="shortName" />
      </span>
      <span
        aria-hidden
        className="absolute inset-0 grid grid-cols-6 [&>i]:bg-ground"
      >
        {[0, 0.12, 0.24, 0.36, 0.48, 0.6].map((alpha) => (
          <i key={alpha} style={{ opacity: alpha }} />
        ))}
      </span>
    </div>
  );
}
