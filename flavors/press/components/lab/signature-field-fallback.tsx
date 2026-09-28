import { Overprint } from "@/flavors/press/components/ui/overprint";
import { cn } from "@/flavors/press/lib/utils";

import { SiteIdentityText } from "@/components/semantic/identity/site-identity";

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
        <SiteIdentityText field="shortName" />
      </Overprint>
    </div>
  );
}
