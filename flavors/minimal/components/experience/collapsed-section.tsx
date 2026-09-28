import * as React from "react";
import { Glyph } from "@/flavors/minimal/components/scene/glyph";
import { FolderPoster } from "@/flavors/minimal/components/scene/posters";
import { Disclosure } from "@/flavors/minimal/components/ui/disclosure";
import type { GlyphViewId } from "@/flavors/minimal/lib/scene/glyphs";

export type CollapsedSectionProps = {
  /** Anchor id: `/work#skills` opens the section. */
  id: string;
  title: string;
  /** How many things are inside, shown beside the title. */
  count: number;
  /** A folder glyph drawn as this 3D view. */
  glyph?: GlyphViewId;
  children: React.ReactNode;
};

/** A secondary /work section that stays one line until asked for. */
export function CollapsedSection({
  id,
  title,
  count,
  glyph,
  children,
}: CollapsedSectionProps) {
  const headingId = `${id}-heading`;

  return (
    <section
      aria-labelledby={headingId}
      data-scene-item={`section:${id}`}
      className="border-b border-hairline first:border-t"
    >
      <Disclosure
        id={id}
        summaryClassName="-mx-3 items-baseline rounded-md px-3 py-4 text-xl leading-(--text-xl--line-height) focus-visible:outline-offset-0"
        contentClassName="pt-2 pb-10"
        summary={
          <h2
            id={headingId}
            className="flex items-baseline gap-3 display text-xl font-book text-foreground"
          >
            {glyph && (
              <Glyph
                kind="folder"
                view={glyph}
                data={{ for: id }}
                className="size-[1.1em] self-center"
              >
                <FolderPoster />
              </Glyph>
            )}
            {title}
            <span className="meta text-subtle tabular-nums">
              <span className="sr-only">(</span>
              {count}
              <span className="sr-only">)</span>
            </span>
          </h2>
        }
      >
        {children}
      </Disclosure>
    </section>
  );
}
