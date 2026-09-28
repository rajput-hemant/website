import { cn } from "@/flavors/maquette/lib/utils";

import { SiteIdentityText } from "@/components/semantic/identity/site-identity";

/**
 * The word as a card test, stepped through six tones like a material
 * sample: shown while the scene loads, without WebGL, and with motion
 * paused.
 */
export function SignatureFieldFallback({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "@container relative grid size-full place-items-center overflow-hidden bg-site",
        className
      )}
    >
      <span className="text-[22cqw] leading-none font-bold tracking-[-0.05em] text-soft select-none">
        <SiteIdentityText field="shortName" />
      </span>
      <span
        aria-hidden
        className="absolute inset-0 grid grid-cols-6 [&>i]:bg-foam"
      >
        {[0, 0.12, 0.24, 0.36, 0.48, 0.6].map((alpha) => (
          <i key={alpha} style={{ opacity: alpha }} />
        ))}
      </span>
    </div>
  );
}
