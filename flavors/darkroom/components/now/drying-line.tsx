import { Art } from "@/flavors/darkroom/components/ui/art";
import { linkClass } from "@/flavors/darkroom/components/ui/link-class";
import { hash, type Archetype } from "@/flavors/darkroom/lib/frame-art";
import { cn, cssVars } from "@/flavors/darkroom/lib/utils";

import type { Now } from "@/lib/data/types";
import { hrefProps } from "@/lib/safe-href";

const PICTURES: Archetype[] = ["sun", "hills", "doc", "terminal", "orb"];
const TILTS = ["-1.4deg", "0.9deg", "-0.5deg", "1.3deg", "-0.9deg"];

/**
 * The drying line: what I'm on now, one print per item, clipped to a wire
 * and still wet. The prints hang at the small angles they were clipped at.
 */
export function DryingLine({
  items,
  className,
}: {
  items: Now["items"];
  className?: string;
}) {
  return (
    <div className={cn("relative pt-3", className)}>
      <span
        aria-hidden
        className="absolute inset-x-[-2vw] top-3 h-px bg-line-strong"
      />
      <ol className="grid gap-x-6 gap-y-12 pt-0 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => (
          <li
            key={item.text}
            data-scene-item={`now:${i}`}
            style={cssVars({ "--tilt": TILTS[i % TILTS.length] ?? "0deg" })}
            className="relative origin-top rotate-(--tilt) pt-5"
          >
            <span
              aria-hidden
              className="absolute top-[-0.4rem] left-1/2 h-6 w-3 -translate-x-1/2 rounded-[2px] bg-soft shadow-[inset_0_-6px_0_var(--color-faint)]"
            />
            <div className="rounded-[2px] bg-paper p-3 shadow-sheet">
              <div className="aspect-[3/2]">
                <Art
                  archetype={PICTURES[i % PICTURES.length] ?? "sun"}
                  seed={hash(item.text)}
                />
              </div>
              <p className="px-1 pt-3 pb-1 text-[1.0625rem] leading-snug font-medium">
                <span className="mr-2 edge">▸{i + 1}</span>
                {item.link ? (
                  <a {...hrefProps(item.link)} className={linkClass}>
                    {item.text}
                  </a>
                ) : (
                  item.text
                )}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
