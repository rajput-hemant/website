import Link from "next/link";
import { Led } from "@/flavors/surface/components/ui/primitives";
import { pad2, Seg } from "@/flavors/surface/components/ui/seg";
import { cn } from "@/flavors/surface/lib/utils";

import { projectStatusLabels } from "@/lib/data/labels";
import type { Project } from "@/lib/data/types";

import { lamp } from "./status";

/**
 * One preset in a bank: its number on a small LCD, the status lamp, the name,
 * the one-line description and a spec block. The whole module opens the
 * project; the key at the bottom is the visible affordance.
 */
export function PresetModule({
  project,
  number,
  detent,
  className,
}: {
  project: Project;
  /** Position in the full list, 1-based: the preset number. */
  number: number;
  /** The knob detent this preset answers to, on pages with a knob. */
  detent?: number;
  className?: string;
}) {
  const state = lamp[project.status];
  const spec = project.stack.slice(0, 4).join(", ");

  return (
    <article
      data-knob-item={detent}
      className={cn(
        "rack-mod group relative flex h-full flex-col gap-4 px-[22px] pt-9 pb-8 data-[knob-active]:shadow-[inset_0_1px_0_var(--color-hi),0_0_0_1px_var(--color-ink-3),0_10px_22px_-16px_rgb(0_0_0/0.45)] motion:transition-transform motion:duration-250 motion:ease-[var(--ease-spring)] fine:has-[a:hover]:-translate-y-[3px]",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="glass px-2.5 py-[7px]">
          <Seg
            value={pad2(number)}
            label={`Preset ${pad2(number)}`}
            className="h-7"
          />
        </div>
        <p className="legend inline-flex items-center gap-2">
          <Led on={state.on} pulse={state.pulse} />
          {projectStatusLabels[project.status]}
        </p>
      </div>
      <h3 className="text-h3 tracking-[-0.012em]">{project.name}</h3>
      <p className="text-base leading-[1.45] text-ink-2">{project.tagline}</p>
      <dl className="seam-t mt-auto grid grid-cols-[auto_1fr] gap-x-3.5 gap-y-[7px] pt-3.5 text-sm font-medium">
        <dt className="legend text-[0.625rem] leading-[1.5]">Year</dt>
        <dd>{project.year}</dd>
        {spec && (
          <>
            <dt className="legend text-[0.625rem] leading-[1.5]">Spec</dt>
            <dd>{spec}</dd>
          </>
        )}
      </dl>
      <Link
        href={`/projects/${project.slug}`}
        data-lamp-host
        className="key key-sm static self-start after:absolute after:inset-0 after:rounded-[10px] after:content-['']"
      >
        <Led />
        Open {project.name}
      </Link>
    </article>
  );
}
