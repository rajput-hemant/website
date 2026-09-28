import { toDrum } from "@/flavors/timetable/lib/board";
import { cn } from "@/flavors/timetable/lib/utils";

export type FlapTextProps = {
  /** Plain text; what screen readers hear. */
  text: string;
  /** Pad to this many modules (blank flaps), so columns line up. */
  cells?: number;
  size?: "sm" | "md" | "lg";
  /** Signal yellow ink, for times and "you are here". */
  signal?: boolean;
  /** Most flaps a cell turns when it riffles into view (default 8). */
  riffle?: number;
  /** Which side the blank padding goes; numbers sit on the right. */
  align?: "start" | "end";
  className?: string;
};

const SIZE = {
  sm: "gap-[2px] text-[0.8125rem] [--cell-h:1.6em] [--cell-w:1.12em]",
  md: "gap-[3px] text-[1.125rem] max-sm:gap-[2px] max-sm:text-[0.9375rem] [--cell-h:1.5em] [--cell-w:1.1em]",
  lg: "gap-[3px] text-[1.375rem] max-sm:text-[1.0625rem] [--cell-h:1.5em] [--cell-w:1.1em]",
} as const;

/**
 * Text set on split-flap modules: one dark card per character, printed from
 * the drum. The cells are decoration; the words are real text beside them.
 * FlapRiffle (deferred) turns them through the drum as they scroll into view,
 * and `flapTo` (motion/riffle) turns them to new text in drum order.
 */
export function FlapText({
  text,
  cells = 0,
  size = "md",
  signal,
  align = "start",
  riffle,
  className,
}: FlapTextProps) {
  const drum =
    align === "end" ? toDrum(text).padStart(cells) : toDrum(text).padEnd(cells);
  return (
    <>
      <span
        aria-hidden
        data-flap
        data-riffle-max={riffle}
        className={cn(
          "inline-flex font-mono leading-none font-bold whitespace-nowrap",
          SIZE[size],
          className
        )}
      >
        {drum.split("").map((char, i) => (
          <span
            key={i}
            data-c={char}
            className={cn(
              "flap-cell grid h-(--cell-h) w-(--cell-w) place-items-center rounded-[3px] pt-[0.1em] text-flap",
              signal && "text-signal"
            )}
          >
            {char}
          </span>
        ))}
      </span>
      <span className="sr-only">{text}</span>
    </>
  );
}
