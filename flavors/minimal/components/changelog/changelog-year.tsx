import { Glyph } from "@/flavors/minimal/components/scene/glyph";
import { RollPoster } from "@/flavors/minimal/components/scene/posters";
import { Disclosure } from "@/flavors/minimal/components/ui/disclosure";
import type { GlyphViewId } from "@/flavors/minimal/lib/scene/glyphs";

import type { ChangelogYear as Year } from "@/lib/data/group-by-year";

import { ChangelogEntry } from "./changelog-entry";
import { yearTimeline } from "./year-index";

export const entriesLabel = (count: number) =>
  count === 1 ? "1 entry" : `${count} entries`;

/** One year of entries behind a "2024 · 3 entries" summary. */
export function ChangelogYear({
  year,
  entries,
  defaultOpen = false,
  roll = null,
}: Year & {
  defaultOpen?: boolean;
  /** Its paper roll: the page's lead glyph, a view, or just the poster. */
  roll?: GlyphViewId | "lead" | null;
}) {
  return (
    <Disclosure
      id={year}
      defaultOpen={defaultOpen}
      style={{ viewTimelineName: yearTimeline(year) }}
      className="scroll-mt-(--header-h) border-b border-hairline"
      summaryClassName="-mx-2 min-h-14 items-center rounded-sm px-2 py-3 transition-colors duration-(--duration-exit) active:bg-surface [&:active_.year-label]:text-accent [&:hover_.year-label]:text-accent"
      contentClassName="pb-4 sm:pl-5.5"
      summary={
        <span className="flex items-baseline gap-3">
          <Glyph
            kind="roll"
            lead={roll === "lead"}
            view={roll === "lead" || roll === null ? undefined : roll}
            className="size-6 self-center"
          >
            <RollPoster />
          </Glyph>
          <span className="year-label display text-2xl font-book text-foreground tabular-nums transition-colors duration-(--duration-exit)">
            {year}
          </span>
          <span className="meta text-subtle tabular-nums">
            {entriesLabel(entries.length)}
          </span>
        </span>
      }
    >
      <ol>
        {entries.map((entry) => (
          <ChangelogEntry key={entry.id} entry={entry} />
        ))}
      </ol>
    </Disclosure>
  );
}
