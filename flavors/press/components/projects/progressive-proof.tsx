import { cn } from "@/flavors/press/lib/utils";

/**
 * A progressive proof of one letter: P1 alone, P2 alone, then both in
 * register, the way a printer checks each plate before the run.
 */
export function ProgressiveProof({
  letter,
  className,
}: {
  letter: string;
  className?: string;
}) {
  const cell =
    "grid size-[1.875rem] place-items-center bg-paper text-[1.3125rem] leading-none font-black";
  return (
    <span aria-hidden className={cn("flex items-end gap-1.5", className)}>
      <span className={cn(cell, "text-pink")}>{letter}</span>
      <span className={cn(cell, "text-blue")}>{letter}</span>
      <span className={cn(cell, "ovp")}>
        <b className="p1">{letter}</b>
        <b className="p2">{letter}</b>
      </span>
    </span>
  );
}
