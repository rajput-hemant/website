import Link from "next/link";
import { SceneGlyph } from "@/flavors/drawing-set/components/site/scene-glyph";
import { Tag } from "@/flavors/drawing-set/components/ui";

import type { LabExperiment, LabSlug } from "@/content/lab";

import { ExperimentPoster } from "./poster";

/** One study sheet on the /lab index: a title strip, the poster and a caption. */
export function StudyCard({
  experiment,
  n,
  glyph,
}: {
  experiment: LabExperiment;
  /** Study number, e.g. "01". */
  n: string;
  /** Draws the study's solid in the card head (L2), in this glyph view slot. */
  glyph?: "a" | "b" | "c" | undefined;
}) {
  return (
    <Link
      href={`/lab/${experiment.slug}`}
      data-tilt
      data-glyph-host
      data-cursor="Open"
      data-scene-item={`study:${experiment.slug}`}
      data-scene-label={experiment.title}
      className="press group relative block"
    >
      <div className="tilt relative overflow-hidden rounded-md border border-line bg-sheet transition-colors duration-(--duration-ui) ease-enter fine:hover:border-accent/40">
        <span
          aria-hidden
          className="tilt-glare pointer-events-none absolute inset-0 z-10"
        />
        <div className="flex items-center justify-between gap-2 border-b border-line-strong bg-sheet-deep px-3 py-1.5">
          <span className="font-mono text-mono-xs tracking-[0.14em] text-ink-faint uppercase">
            Study {n}
          </span>
          <span className="flex items-center gap-2">
            {glyph ? (
              <SceneGlyph
                kind="solid"
                slot={glyph}
                data={{ "data-study": Number(n) - 1 }}
                className="-my-3 size-9"
              />
            ) : null}
            <Tag>{experiment.status}</Tag>
          </span>
        </div>
        <div className="aspect-video overflow-hidden border-b border-line">
          <ExperimentPoster slug={experiment.slug as LabSlug} />
        </div>
        <div className="p-4">
          <span className="font-mono text-mono-xs text-ink-faint tabular-nums">
            {experiment.year}
          </span>
          <h2 className="mt-2 font-display text-lg tracking-[-0.01em] text-ink uppercase [font-stretch:70%]">
            {experiment.title}
          </h2>
          <p className="mt-1.5 text-sm text-ink-soft">
            {experiment.description}
          </p>
        </div>
      </div>
    </Link>
  );
}
