import { cn } from "@/flavors/timetable/lib/utils";

/**
 * A project's stack as the stops a service calls at, top to bottom: the main
 * platform first, the last stop last. A real list; the line is decoration.
 */
export function CallingPattern({
  stops,
  className,
}: {
  stops: string[];
  className?: string;
}) {
  return (
    <ol className={cn("relative", className)}>
      {stops.map((stop, i) => {
        const end = i === 0 || i === stops.length - 1;
        return (
          <li
            key={stop}
            className="relative grid min-h-11 grid-cols-[2rem_minmax(0,1fr)] items-center gap-3"
          >
            <span aria-hidden className="relative flex h-full justify-center">
              <span
                className={cn(
                  "absolute w-[5px] bg-ink",
                  i === 0 ? "top-1/2 bottom-0" : "top-0",
                  i === stops.length - 1 ? "bottom-1/2" : "bottom-0"
                )}
              />
              <span
                className={cn(
                  "relative self-center rounded-full border-[3px] border-ink bg-ground",
                  end ? "size-4" : "size-3"
                )}
              />
            </span>
            <span
              className={cn(
                "pt-0.5 leading-tight",
                end ? "text-lead font-extrabold" : "text-base font-medium"
              )}
            >
              {stop}
              {i === 0 ? (
                <span className="ml-2 font-mono text-mono-xs font-semibold tracking-[0.08em] text-ink-soft uppercase">
                  Platform
                </span>
              ) : null}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
