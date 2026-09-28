"use client";

import { lightAt, planShadow, type PlanRect } from "@/flavors/maquette/lib/sun";
import { useSunMinutes } from "@/flavors/maquette/lib/sun-store";

import { useRootData } from "@/components/semantic/use-root-data";

/**
 * A piece's shadow on its plan, cast by the same sun (or lamp) as the
 * model: it follows the shadow study's slider on every card at once.
 */
export function PlanShadow({
  rect,
  height,
  className,
}: {
  rect: PlanRect;
  /** The piece's height in the plan's units. */
  height: number;
  className?: string;
}) {
  const minutes = useSunMinutes();
  const night = useRootData("theme", "light") === "dark";
  return (
    <polygon
      className={className}
      points={planShadow(rect, height, lightAt(minutes, night))}
    />
  );
}
