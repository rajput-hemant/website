import Link from "next/link";
import { CatalogueNumber } from "@/flavors/drawing-set/components/ui";
import { cn } from "@/flavors/drawing-set/lib/utils";

import type { Project } from "@/lib/data/types";

import { DrawingFrame } from "./drawing-frame";
import { StatusStamp } from "./status-stamp";

export type ProjectSheetProps = {
  project: Project;
  /** Position in the full register, for the drawing number. */
  number: number;
  className?: string;
};

/** A featured project as a large sheet: the view, then a title strip. Tilts on fine pointers. */
export function ProjectSheet({
  project,
  number,
  className,
}: ProjectSheetProps) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      data-tilt
      data-cursor="Open"
      className={cn(
        "tilt group relative block border border-line bg-sheet p-3 transition-colors duration-200 fine:hover:border-line-strong",
        className
      )}
    >
      <span aria-hidden className="tilt-glare" />
      <DrawingFrame
        view="View A"
        caption={project.image ? project.image.alt : "Drawing to follow"}
        image={project.image}
        sizes="(min-width: 64rem) 33vw, (min-width: 40rem) 50vw, 100vw"
      />
      <div className="mt-3 grid grid-cols-[1fr_auto] items-end gap-x-4 gap-y-2 border-t border-line-strong pt-3">
        <h3 className="font-display text-h3 leading-[0.95] font-[540] uppercase [font-stretch:66%] transition-colors duration-200 fine:group-hover:text-accent">
          {project.name}
        </h3>
        <StatusStamp status={project.status} />
        <p className="col-span-2 text-sm text-ink-soft">{project.tagline}</p>
        <p className="col-span-2 flex justify-between font-mono text-mono-xs tracking-[0.08em] text-ink-faint uppercase tabular-nums">
          <CatalogueNumber n={number} className="text-ink-faint" />
          <span>{project.year ?? ""}</span>
        </p>
      </div>
    </Link>
  );
}
