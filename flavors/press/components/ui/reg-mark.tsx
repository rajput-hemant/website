import { cn } from "@/flavors/press/lib/utils";

const TARGET = (
  <>
    <circle cx="11" cy="11" r="6" fill="none" stroke="currentColor" />
    <path d="M11 0v22M0 11h22" stroke="currentColor" />
    <circle cx="11" cy="11" r="2.2" fill="currentColor" />
  </>
);

/** A registration target printed on all three plates; only blue stays put. */
export function RegMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 22 22"
      aria-hidden
      focusable="false"
      className={cn("reg overflow-visible", className)}
    >
      <g className="r1">{TARGET}</g>
      <g className="r2">{TARGET}</g>
      <g className="r3">{TARGET}</g>
    </svg>
  );
}
