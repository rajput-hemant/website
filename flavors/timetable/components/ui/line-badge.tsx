import { cn } from "@/flavors/timetable/lib/utils";

export type LineBadgeProps = {
  /** Line colour slot, 1 to 6. */
  line: number;
  /** The company, whose initial the roundel carries. */
  name: string;
  size?: "sm" | "md";
  className?: string;
};

export const lineVar = (line: number) => `var(--color-line-${line})`;

/** A line's roundel: its colour and its initial, like a metro line bullet. */
export function LineBadge({
  line,
  name,
  size = "md",
  className,
}: LineBadgeProps) {
  return (
    <span
      aria-hidden
      style={{ backgroundColor: lineVar(line) }}
      className={cn(
        "inline-grid flex-none place-items-center rounded-full pt-[0.08em] leading-none font-extrabold text-badge-ink",
        size === "md" ? "size-7 text-[0.8125rem]" : "size-5 text-[0.6875rem]",
        className
      )}
    >
      {name.trim().charAt(0).toUpperCase()}
    </span>
  );
}
