import Link from "next/link";
import { Overprint } from "@/flavors/press/components/ui/overprint";
import { pad2 } from "@/flavors/press/lib/proof";
import { cn, route } from "@/flavors/press/lib/utils";

import type { Project } from "@/lib/data/types";

import { ProgressiveProof } from "./progressive-proof";
import { StatusStamp } from "./status-stamp";

/**
 * One project as a signature pulled for proofing: trimmed with crop marks,
 * numbered, stamped with its status, and registering when you point at it.
 */
export function ProofCard({
  project,
  sig,
  size = "lg",
  className,
}: {
  project: Project;
  sig: number;
  size?: "lg" | "sm";
  className?: string;
}) {
  return (
    <article
      data-tilt
      data-scene-item={`project:${project.slug}`}
      className={cn(
        "tilt registers crop-marks flex flex-col bg-sheet shadow-sheet",
        size === "lg"
          ? "min-h-[20rem] px-5 pt-5 pb-6 sm:px-7 sm:pt-6"
          : "min-h-[14rem] px-5 pt-4 pb-5",
        className
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <span className="slug">
          Sig. {pad2(sig)} &nbsp;/&nbsp; {project.year}
        </span>
        <StatusStamp status={project.status} />
      </div>
      <h3
        className={cn(
          "tracking-[-0.04em]",
          size === "lg"
            ? "mt-12 text-[clamp(2.5rem,1.4rem+3vw,4.25rem)] leading-[0.9]"
            : "mt-8 text-[clamp(1.75rem,1.2rem+1.4vw,2.5rem)] leading-[0.92]"
        )}
      >
        <Link
          href={route(`/projects/${project.slug}`)}
          data-cursor="Pull the proof"
          className="outline-none after:absolute after:inset-0 focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-focus"
        >
          <Overprint>{project.name}</Overprint>
        </Link>
      </h3>
      <p
        className={cn(
          "mt-4 max-w-[36ch] leading-snug",
          size === "lg" ? "text-lead" : "text-base"
        )}
      >
        {project.tagline}
      </p>
      <div className="mt-auto flex flex-wrap items-end justify-between gap-4 pt-7">
        <span className="max-w-[28ch] slug">
          {project.stack.slice(0, 4).join(" / ")}
        </span>
        <ProgressiveProof letter={project.name.charAt(0)} />
      </div>
    </article>
  );
}
