import { cn } from "@/flavors/timetable/lib/utils";

import { SiteIdentityText } from "@/components/semantic/identity/site-identity";

/** The word in heavy signage type: shown while the scene loads, without WebGL, and with motion paused. */
export function SignatureFieldFallback({
  className,
}: {
  className?: string | undefined;
}) {
  return (
    <div
      className={cn(
        "@container grid size-full place-items-center bg-board",
        className
      )}
    >
      <span className="text-[22cqw] leading-none font-extrabold tracking-[-0.04em] text-flap select-none">
        <SiteIdentityText field="shortName" />
      </span>
    </div>
  );
}
