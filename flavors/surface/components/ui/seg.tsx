import { cn } from "@/flavors/surface/lib/utils";

/* Segment outlines in a 36x64 cell, clockwise from the top (a to g). */
const SEGMENTS = {
  a: "5,3 8,0 28,0 31,3 28,6 8,6",
  b: "33,5 36,8 36,28 33,31 30,28 30,8",
  c: "33,33 36,36 36,56 33,59 30,56 30,36",
  d: "5,61 8,58 28,58 31,61 28,64 8,64",
  e: "3,33 6,36 6,56 3,59 0,56 0,36",
  f: "3,5 6,8 6,28 3,31 0,28 0,8",
  g: "5,32 8,29 28,29 31,32 28,35 8,35",
} as const;

type Segment = keyof typeof SEGMENTS;

const GLYPHS: Record<string, readonly Segment[]> = {
  "0": ["a", "b", "c", "d", "e", "f"],
  "1": ["b", "c"],
  "2": ["a", "b", "g", "e", "d"],
  "3": ["a", "b", "g", "c", "d"],
  "4": ["f", "g", "b", "c"],
  "5": ["a", "f", "g", "c", "d"],
  "6": ["a", "f", "g", "e", "c", "d"],
  "7": ["a", "b", "c"],
  "8": ["a", "b", "c", "d", "e", "f", "g"],
  "9": ["a", "b", "c", "d", "f", "g"],
  "-": ["g"],
  " ": [],
};

const ALL = Object.keys(SEGMENTS) as Segment[];
const PITCH = 46;

/**
 * Hand-built seven-segment numerals. Unlit segments ghost through at 9%, as on
 * a real reflective LCD. The value is also real text for screen readers and
 * search, so the SVG is decoration.
 */
export function Seg({
  value,
  label,
  className,
}: {
  value: string;
  /** What a screen reader hears instead of the digits, when they need context. */
  label?: string;
  className?: string;
}) {
  const chars = [...value];
  const width = chars.length * PITCH - 10 + 7;

  return (
    <span className={cn("inline-flex", className)}>
      <span className="sr-only">{label ?? value}</span>
      <svg
        aria-hidden
        focusable="false"
        viewBox={`-7 0 ${width} 64`}
        className="block h-full w-auto fill-current"
      >
        <g transform="skewX(-6)">
          {chars.map((char, i) => {
            const lit = GLYPHS[char] ?? [];
            return (
              <g key={i} transform={`translate(${i * PITCH} 0)`}>
                {ALL.map((segment) => (
                  <polygon
                    key={segment}
                    points={SEGMENTS[segment]}
                    opacity={lit.includes(segment) ? 1 : 0.09}
                  />
                ))}
              </g>
            );
          })}
        </g>
      </svg>
    </span>
  );
}

export const pad2 = (n: number) => String(n).padStart(2, "0");
