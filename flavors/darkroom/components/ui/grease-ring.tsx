import { cn } from "@/flavors/darkroom/lib/utils";

/* Two hand-drawn loops, so neighbouring frames never get the same stroke. */
const LOOPS = [
  "M20 18C42 4 84 6 94 30 102 52 88 86 52 92 22 96 4 76 6 50 8 30 22 14 48 9",
  "M76 10C96 18 100 52 90 74 78 94 36 98 16 82 0 66 4 26 26 14 44 4 70 6 86 16",
];

/** The grease-pencil ring around a frame: drawn on hover, focus or when its row is pointed at. */
export function GreaseRing({
  n,
  className,
}: {
  n: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden
      focusable="false"
      className={cn(
        "grease-loop pointer-events-none absolute -inset-x-[12%] -inset-y-[17%] h-[134%] w-[124%] overflow-visible",
        className
      )}
    >
      <path className="grease" pathLength={1} d={LOOPS[n % 2]} />
    </svg>
  );
}

/** Crop marks in wax at a select's four corners. */
export function CropMarks() {
  return (
    <svg
      viewBox="0 0 150 100"
      preserveAspectRatio="none"
      aria-hidden
      focusable="false"
      className="crop pointer-events-none absolute inset-0 size-full overflow-visible"
    >
      <path
        className="grease"
        d="M16 30V14H36M114 14H134V30M16 70V86H36M114 86H134V70"
      />
    </svg>
  );
}
