import {
  GlyphAnchor,
  GlyphPoster,
  glyphProps,
} from "@/flavors/minimal/components/scene/glyph";
import { UrlLink } from "@/flavors/minimal/components/ui/url-link";
import { cn } from "@/flavors/minimal/lib/utils";

import type { Now } from "@/lib/data/types";

import { fitsTwoColumns } from "./now-layout";

/**
 * The current focus, as numbered statements with an optional link each. A
 * list of short items splits into two ruled columns from tablet width.
 */
export function NowList({ items }: { items: Now["items"] }) {
  const split = fitsTwoColumns(items);

  return (
    <ol
      {...glyphProps("tabs", "tabs")}
      className={cn(
        "border-t border-hairline",
        split && "md:grid md:grid-cols-2 md:gap-x-10"
      )}
    >
      {items.map((item, index) => (
        <li
          key={item.text}
          data-scene-item={`now:${index}`}
          className={cn(
            "grid grid-cols-[2.25rem_1fr] gap-x-3 border-b border-hairline py-5 sm:grid-cols-[3rem_1fr] sm:py-6",
            split && "md:grid-cols-[2.25rem_1fr] md:py-4"
          )}
        >
          <span
            aria-hidden
            className="relative self-start justify-self-start pt-[0.45rem] meta text-subtle tabular-nums"
          >
            {/* The paper tab on the numeral's left edge; the canvas draws it in the margin. */}
            <GlyphAnchor
              id={String(index)}
              className="absolute top-[0.4rem] -left-3.5 h-4 w-2.5"
            >
              <GlyphPoster className="rounded-[2px] border border-hairline bg-surface" />
            </GlyphAnchor>
            {String(index + 1).padStart(2, "0")}
          </span>
          <div className="min-w-0">
            <p
              className={cn("text-lg text-foreground", split && "md:text-base")}
            >
              {item.text}
            </p>
            {item.link && (
              <p className="mt-1.5 text-sm text-muted">
                <UrlLink href={item.link} />
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
