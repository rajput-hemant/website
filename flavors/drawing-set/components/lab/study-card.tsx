import Link from "next/link";
import { Tag } from "@/flavors/drawing-set/components/ui";

import type { LabExperiment, LabSlug } from "@/content/lab";

import { ExperimentPoster } from "./poster";

/** One study sheet on the /lab index: a title strip, the poster and a caption. */
export function StudyCard({
  experiment,
  n,
}: {
  experiment: LabExperiment;
  /** Study number, e.g. "01". */
  n: string;
}) {
  return (
    <Link
      href={`/lab/${experiment.slug}`}
      data-tilt
      data-cursor="Open"
      data-scene-item={`study:${experiment.slug}`}
      className="tilt press group relative block overflow-hidden rounded-md border border-line bg-sheet transition-colors duration-(--duration-ui) ease-enter hover:border-accent/40"
    >
      <span
        aria-hidden
        className="tilt-glare pointer-events-none absolute inset-0 z-10"
      />
      <div className="flex items-center justify-between gap-2 border-b border-line-strong bg-sheet-deep px-3 py-1.5">
        <span className="font-mono text-mono-xs tracking-[0.14em] text-ink-faint uppercase">
          Study {n}
        </span>
        <Tag>{experiment.status}</Tag>
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
        <p className="mt-1.5 text-sm text-ink-soft">{experiment.description}</p>
      </div>
    </Link>
  );
}
