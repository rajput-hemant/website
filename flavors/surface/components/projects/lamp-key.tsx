import { Led } from "@/flavors/surface/components/ui/primitives";
import { cn } from "@/flavors/surface/lib/utils";

/** What the preset lamps mean. */
export function LampKey({ className }: { className?: string }) {
  return (
    <ul
      aria-label="Status lamp key"
      className={cn("legend flex flex-wrap gap-x-[22px] gap-y-2.5", className)}
    >
      <li className="flex items-center gap-2">
        <Led on />
        Steady: active or maintained
      </li>
      <li className="flex items-center gap-2">
        <Led on pulse />
        Pulsing: in progress
      </li>
      <li className="flex items-center gap-2">
        <Led />
        Dark: archived
      </li>
    </ul>
  );
}
