import {
  phaseDates,
  type PhasingPlan as Plan,
} from "@/flavors/maquette/lib/model";
import { cn, cssVars } from "@/flavors/maquette/lib/utils";

/**
 * The phasing plan: every role as a dated phase on one axis from the first
 * start to now, one hairline per month. The current phase is basswood.
 */
export function PhasingPlan({
  plan,
  hrefFor,
  className,
}: {
  plan: Plan;
  /** Where a phase's name links, by role id. */
  hrefFor?: (id: string) => string;
  className?: string;
}) {
  const row =
    "grid grid-cols-[4.875rem_minmax(0,1fr)_6.75rem] items-center gap-x-2.5 sm:grid-cols-[7rem_minmax(0,1fr)_7.75rem] sm:gap-x-3";
  return (
    <div className={cn("min-w-0", className)}>
      <div aria-hidden className={cn(row, "h-4.5 num")}>
        <span />
        <div className="relative h-4.5 border-b border-line">
          {plan.ticks.map((tick, i) => (
            <span
              key={tick.label}
              style={cssVars({ "--at": `${(tick.at * 100).toFixed(2)}%` })}
              className={cn(
                "absolute bottom-1 left-(--at) whitespace-nowrap max-sm:text-[10px]",
                i === 0
                  ? ""
                  : i === plan.ticks.length - 1
                    ? "-translate-x-full"
                    : "-translate-x-1/2"
              )}
            >
              {tick.label}
            </span>
          ))}
        </div>
        <span />
      </div>
      <ol>
        {plan.phases.map((phase) => {
          const name = (
            <span className="font-display text-[0.8125rem] leading-none font-medium whitespace-nowrap max-sm:text-xs">
              {phase.role.company}
            </span>
          );
          return (
            <li
              key={phase.role.id}
              data-scene-item={`role:${phase.role.id}`}
              className={cn(row, "h-4")}
            >
              {hrefFor ? (
                <a
                  href={hrefFor(phase.role.id)}
                  className="truncate fine:hover:text-cut"
                >
                  {name}
                </a>
              ) : (
                name
              )}
              <span
                style={cssVars({
                  "--s": `${(phase.start * 100).toFixed(2)}%`,
                  "--w": `${(phase.span * 100).toFixed(2)}%`,
                  "--months": String(plan.months),
                })}
                className="phase-track relative h-4"
              >
                <span
                  className={cn(
                    "absolute top-1 left-(--s) h-2 w-(--w) border shadow-[0_3px_5px_-3px_var(--color-shade)]",
                    phase.current
                      ? "border-wood bg-wood"
                      : "border-piece-edge bg-piece"
                  )}
                />
              </span>
              <span className="text-right num text-[10.5px] leading-none whitespace-nowrap max-sm:text-[9.5px]">
                <span className="sr-only">
                  Phase {phase.n}, {phase.role.title},{" "}
                </span>
                {phaseDates(phase.role)}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
