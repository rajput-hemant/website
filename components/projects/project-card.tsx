import Image from "next/image";
import Link from "next/link";

import { projectStatusLabels } from "@/lib/data/labels";
import type { Project } from "@/lib/data/types";
import { cn } from "@/lib/utils";
import { CatalogueNumber, Tag } from "@/components/ui";

import { SpecimenBox } from "./specimen-box";

const STACK_PREVIEW = 4;

export type ProjectCardProps = {
  project: Project;
  /** This project's position in the full archive, for its catalogue number. */
  number: number;
  className?: string;
};

/**
 * A large index card for a featured project: cover (or a specimen box when
 * there is none), catalogue number, name, tagline, stack and status. Tilts
 * toward the pointer and opens the case-study route.
 */
export function ProjectCard({ project, number, className }: ProjectCardProps) {
  return (
    <li className={cn("list-none", className)}>
      <Link
        href={`/projects/${project.slug}`}
        data-tilt
        data-cursor="Open"
        className="tilt group relative block rounded-md border-t-2 border-t-accent bg-ink-raised p-4 focus-visible:outline-offset-4"
      >
        <span aria-hidden className="tilt-glare" />

        {project.image ? (
          <Image
            src={project.image.url}
            alt={project.image.alt}
            width={project.image.width}
            height={project.image.height}
            sizes="(min-width: 64rem) 28rem, (min-width: 40rem) 50vw, 100vw"
            placeholder={project.image.blurDataUrl ? "blur" : "empty"}
            blurDataURL={project.image.blurDataUrl}
            className="aspect-[16/10] w-full rounded-md object-cover"
          />
        ) : (
          <SpecimenBox label={project.name} />
        )}

        <div className="mt-4 flex items-baseline justify-between gap-4">
          <CatalogueNumber n={number} />
          <span className="font-mono text-mono-xs text-pencil tabular-nums">
            {project.year}
          </span>
        </div>

        <h3 className="mt-2 font-display text-xl text-paper">{project.name}</h3>
        <p className="mt-1 text-graphite">{project.tagline}</p>

        {project.stack.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Stack">
            {project.stack.slice(0, STACK_PREVIEW).map((name) => (
              <li key={name}>
                <Tag>{name}</Tag>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-3 font-mono text-mono-xs tracking-[0.14em] text-pencil uppercase">
          {projectStatusLabels[project.status]}
        </p>
      </Link>
    </li>
  );
}
