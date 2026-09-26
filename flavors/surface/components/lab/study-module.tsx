import Link from "next/link";
import { Led } from "@/flavors/surface/components/ui/primitives";
import { pad2, Seg } from "@/flavors/surface/components/ui/seg";

import type { LabExperiment, LabSlug } from "@/content/lab";
import { labStatusLabels } from "@/lib/data/labels";

import { ExperimentPoster } from "./poster";

/** One study on the lab index: a rack module with its number, status lamp, screen and caption. */
export function StudyModule({
  experiment,
  number,
  detent,
}: {
  experiment: LabExperiment;
  number: number;
  detent?: number;
}) {
  return (
    <article
      data-knob-item={detent}
      className="rack-mod group relative flex h-full flex-col gap-4 px-[22px] pt-9 pb-8 data-[knob-active]:shadow-[inset_0_1px_0_var(--color-hi),0_0_0_1px_var(--color-ink-3)] motion:transition-transform motion:duration-250 fine:has-[a:hover]:-translate-y-[3px]"
    >
      <div className="flex items-center justify-between">
        <div className="glass px-2.5 py-[7px]">
          <Seg
            value={pad2(number)}
            label={`Study ${pad2(number)}`}
            className="h-7"
          />
        </div>
        <p className="legend inline-flex items-center gap-2">
          <Led
            on={experiment.status !== "archived"}
            pulse={experiment.status === "in-progress"}
          />
          {labStatusLabels[experiment.status]}
        </p>
      </div>
      <div className="glass aspect-video overflow-hidden p-1.5">
        <ExperimentPoster
          slug={experiment.slug as LabSlug}
          className="rounded-[3px]"
        />
      </div>
      <h2 className="text-h3 tracking-[-0.012em]">{experiment.title}</h2>
      <p className="text-base leading-[1.45] text-ink-2">
        {experiment.description}
      </p>
      <dl className="seam-t mt-auto grid grid-cols-[auto_1fr] gap-x-3.5 gap-y-[7px] pt-3.5 text-sm font-medium">
        <dt className="legend text-[0.625rem] leading-[1.5]">Year</dt>
        <dd>{experiment.year}</dd>
        <dt className="legend text-[0.625rem] leading-[1.5]">Spec</dt>
        <dd>{experiment.tags.join(", ")}</dd>
      </dl>
      <Link
        href={`/lab/${experiment.slug}`}
        data-lamp-host
        className="key key-sm static self-start after:absolute after:inset-0 after:rounded-[10px] after:content-['']"
      >
        <Led />
        Open {experiment.title}
      </Link>
    </article>
  );
}
