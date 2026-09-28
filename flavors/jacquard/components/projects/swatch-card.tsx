import Link from "next/link";
import { MuseumLabel } from "@/flavors/jacquard/components/ui/museum-label";
import { cn } from "@/flavors/jacquard/lib/utils";
import {
  endFor,
  pad2,
  type Draft,
  type Pick,
} from "@/flavors/jacquard/lib/weave";

import { projectStatusLabels } from "@/lib/data/labels";
import type { Project } from "@/lib/data/types";

import { SwatchCloth } from "./swatch-cloth";

/**
 * A project's materials, each one a thread to point at: its end lights in the
 * swatch, the draft and the cloth. Decoration on a fact that is already text,
 * so it stays out of the tab order.
 */
export function Materials({ draft, stack }: { draft: Draft; stack: string[] }) {
  return (
    <span className="leading-relaxed">
      {stack.map((tech, i) => {
        const end = endFor(draft, tech);
        return (
          <span key={tech}>
            {i > 0 ? ", " : null}
            {end ? (
              <span
                data-weave-end={end.index}
                className="thread-link fine:hover:text-madder"
              >
                {tech}
              </span>
            ) : (
              tech
            )}
          </span>
        );
      })}
    </span>
  );
}

export const technique = (draft: Draft, pick: Pick | undefined) =>
  pick
    ? `${pick.ends.length} of ${draft.ends.length} ends, stepped twill`
    : "Loom state, no stack recorded";

/**
 * One swatch in the book: the cloth woven from the project's pick, its pick
 * and accession number, the name, and the catalogue entry.
 */
export function SwatchCard({
  project,
  draft,
  pick,
  accession,
  headingLevel = "h3",
  className,
}: {
  project: Project;
  draft: Draft;
  pick: Pick | undefined;
  accession: string;
  headingLevel?: "h2" | "h3";
  className?: string;
}) {
  const Heading = headingLevel;
  const status = projectStatusLabels[project.status].toLowerCase();
  return (
    <article
      data-weave-pick={pick?.index}
      className={cn("group/swatch min-w-0", className)}
    >
      <SwatchCloth
        id={project.slug}
        draft={draft}
        pick={pick}
        selvedge={`${project.name} · ${accession} · ${projectStatusLabels[project.status]}`}
        className="transition-transform duration-300 ease-out motion:fine:group-hover/swatch:-translate-y-1"
      />
      <p className="mt-8 label">
        {pick ? `Pick ${pad2(pick.index + 1)} · ` : ""}
        {accession}
      </p>
      <Heading className="mt-2 text-h3">
        <Link
          href={`/projects/${project.slug}`}
          className="transition-colors duration-(--duration-ui) ease-out fine:hover:text-madder"
        >
          {project.name}
        </Link>
      </Heading>
      <p className="mt-2 min-h-[2.9em] text-[0.9375rem] leading-snug text-ink-soft">
        {project.tagline}
      </p>
      <MuseumLabel
        className="mt-4 text-[0.8125rem]"
        rows={[
          {
            label: "Date",
            value:
              project.year === null ? status : `${project.year}, ${status}`,
          },
          {
            label: "Materials",
            value: <Materials draft={draft} stack={project.stack} />,
          },
          { label: "Technique", value: technique(draft, pick) },
        ]}
      />
    </article>
  );
}
